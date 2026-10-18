#!/bin/bash
# Runs on the rented machine. Builds llama.cpp for the V100 (sm_70) at a pinned
# commit, downloads the seated GGUF, refuses to serve it unless its sha256 is the
# one that passed calibration, and serves it on 127.0.0.1:8080 with the settings
# the calibration used. The weekly run reaches it through an SSH tunnel; the
# port is never exposed.
set -euo pipefail

LLAMA_COMMIT=797de63b2fa7396dcc8caca76834c699ac84e1c3
GGUF=Qwen3-30B-A3B-Thinking-2507-Q8_0.gguf
URL=https://huggingface.co/unsloth/Qwen3-30B-A3B-Thinking-2507-GGUF/resolve/main/$GGUF
SHA256=6326967c7bad05e9820421a593d48e315416b214cef56f1ca3c1f9d9a6e0f1c6

export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -qq >/dev/null
sudo apt-get install -y -qq cmake build-essential aria2 git >/dev/null
mkdir -p ~/models ~/logs

aria2c -q -x 16 -s 16 -k 64M -d ~/models -o "$GGUF" "$URL" &
download=$!

export PATH=/usr/local/cuda/bin:$PATH
git clone -q https://github.com/ggml-org/llama.cpp ~/llama.cpp
git -C ~/llama.cpp checkout -q "$LLAMA_COMMIT"
cmake -S ~/llama.cpp -B ~/llama.cpp/build -DGGML_CUDA=ON -DCMAKE_CUDA_ARCHITECTURES=70 \
  -DLLAMA_CURL=OFF -DCMAKE_BUILD_TYPE=Release > ~/logs/cmake.log
cmake --build ~/llama.cpp/build --config Release -j "$(nproc)" --target llama-server > ~/logs/build.log

wait "$download"
echo "$SHA256  $HOME/models/$GGUF" | sha256sum -c --quiet || { echo "sha256 mismatch: not the seated file"; exit 1; }

# One slot: the panel scores lessons one at a time. 24,576 tokens holds the
# judge prompt (up to about 7,600 tokens) and the 12,000-token reply.
nohup ~/llama.cpp/build/bin/llama-server -m ~/models/$GGUF -ngl 999 -c 24576 -np 1 \
  --host 127.0.0.1 --port 8080 --jinja --reasoning-format none \
  > ~/logs/server.log 2>&1 < /dev/null &
for i in $(seq 1 120); do
  curl -sf http://127.0.0.1:8080/health >/dev/null && { echo "serving $GGUF"; exit 0; }
  sleep 5
done
echo "server did not come up"; tail -20 ~/logs/server.log; exit 1
