"""Builds the offline "Ready for work" course: public/offline/ready-for-work/.

Two files, no server and no network: index.html (content/offline/app.html) and
course-data.js (the approved lessons in content/offline/ready-for-work/, in order).
Everything is scored in the browser, so the folder works from a phone, a Kiwix
hotspot or a ZIM file.

    python scripts/build_offline_course.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'content/offline/ready-for-work'
OUT = ROOT / 'public/offline/ready-for-work'


def main() -> None:
    lessons = []
    for f in sorted(SRC.glob('[0-9][0-9].json')):
        d = json.loads(f.read_text(encoding='utf-8'))
        lessons.append({'lesson': d['lesson'], 'items': d['items']})
    OUT.mkdir(parents=True, exist_ok=True)
    data = json.dumps({'version': 1, 'lessons': lessons}, ensure_ascii=False, separators=(',', ':'))
    (OUT / 'course-data.js').write_text('window.COURSE = ' + data + ';\n', encoding='utf-8')
    (OUT / 'index.html').write_text((ROOT / 'content/offline/app.html').read_text(encoding='utf-8'), encoding='utf-8')
    print(f'{len(lessons)} lessons, {len(data) // 1024} KB of data -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
