#!/usr/bin/env python3
"""Rent a GPU for the open seat, and give it back.

The open judge (SERVED_JUDGES in panel.py) is a GGUF served by llama.cpp, not a
hosted API. The weekly panel run rents two 32 GB V100 cards on CloudRift for
the length of the run, serves the seated file there, and terminates the
machine at the end whatever happened in between. Every machine this script
rents carries one tag, so `down` can find and terminate them all, including
one a cancelled run left behind.

    python pipeline/served_judge_vm.py up --public-key ~/.ssh/run.pub   # prints the IP
    python pipeline/served_judge_vm.py down

The API key is read from CLOUDRIFT_API_KEY in the environment, never from a
file. Standard library only.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

API = 'https://api.cloudrift.ai/api/v1'
TAG = 'masar-open-judge'
# Two 32 GB V100 cards: the seated Q8_0 file is 32.5 GB. The first variant that
# has a free node is rented.
VARIANTS = ('v100-5-85-400-generic.2', 'v100-5-85-800-generic.2')
IMAGE = ('https://storage.googleapis.com/cloudrift-vm-disks/disks/github/'
         'ubuntu-noble-server-gpup-580-129-20260916-043401.img')


def call(path: str, data: dict, auth: bool = True) -> dict:
    headers = {'Content-Type': 'application/json'}
    if auth:
        headers['X-API-Key'] = os.environ['CLOUDRIFT_API_KEY']
    req = urllib.request.Request(f'{API}/{path}', method='POST', headers=headers,
                                 data=json.dumps({'version': '~upcoming', 'data': data}).encode())
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode() or '{}').get('data', {})


def pick_variant() -> tuple[str, str]:
    types = call('instance-types/list', {'services': ['vm']}, auth=False)['instance_types']
    variants = {v['name']: v for t in types for v in t['variants']}
    for name in VARIANTS:
        free = (variants.get(name) or {}).get('available_nodes_per_dc') or {}
        for dc, n in free.items():
            if n:
                return name, dc
    raise SystemExit(f'no free node for any of {", ".join(VARIANTS)}')


def mine() -> list[dict]:
    data = call('instances/list', {'selector': {'ByTags': {'any': [TAG]}},
                                   'mask': {'with_connection_info': True}})
    return [i for i in data.get('instances', []) if i.get('status') not in ('Inactive',)]


def down() -> int:
    if not mine():
        print('nothing to terminate')
        return 0
    call('instances/terminate', {'selector': {'ByTags': {'any': [TAG]}}})
    for _ in range(30):
        left = [i for i in mine() if i.get('status') != 'Deactivating']
        if not left:
            print('terminated')
            return 0
        time.sleep(10)
    print('error: an instance is still active after terminate; check the console', file=sys.stderr)
    return 1


def up(public_key: Path) -> int:
    down()  # a machine a cancelled run left behind is not reused, it is ended
    variant, dc = pick_variant()
    ids = call('instances/rent', {
        'selector': {'ByInstanceTypeAndLocation': {'instance_type': variant, 'datacenters': [dc]}},
        'with_public_ip': True,
        'tags': [TAG],
        'config': {'VirtualMachine': {
            'image_url': IMAGE,
            'ssh_key': {'PublicKeys': [public_key.read_text().strip()]},
        }},
    })['instance_ids']
    print(f'rented {variant} in {dc}: {ids[0]}', file=sys.stderr)
    for _ in range(90):
        inst = next((i for i in mine() if i['id'] == ids[0]), None)
        if inst and inst.get('status') == 'Failed':
            print(f'error: rental failed: {inst.get("failure")}', file=sys.stderr)
            down()
            return 1
        if inst and inst.get('status') == 'Active' and inst.get('host_address'):
            print(inst['host_address'])
            return 0
        time.sleep(10)
    print('error: the machine did not become active in 15 minutes', file=sys.stderr)
    down()
    return 1


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    u = sub.add_parser('up')
    u.add_argument('--public-key', type=Path, required=True)
    sub.add_parser('down')
    args = ap.parse_args(argv)
    if 'CLOUDRIFT_API_KEY' not in os.environ:
        print('error: CLOUDRIFT_API_KEY is not set', file=sys.stderr)
        return 2
    return up(args.public_key) if args.cmd == 'up' else down()


if __name__ == '__main__':
    sys.exit(main())
