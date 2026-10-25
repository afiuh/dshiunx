#!/usr/bin/env python3
"""独立 WeType 流式 ASR：WAV(16k mono s16le) -> 文本，不经过 fcitx5。"""

import argparse
import base64
import json
import subprocess
import sys
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
ENGINE = HERE / "wetype_streaming.py"


def read_pcm(path: Path) -> bytes:
    with wave.open(str(path), "rb") as w:
        if w.getnchannels() != 1 or w.getsampwidth() != 2 or w.getframerate() != 16000:
            raise SystemExit("需要 16kHz / 单声道 / 16-bit WAV")
        return w.readframes(w.getnframes())


def transcribe(pcm: bytes) -> str:
    proc = subprocess.Popen(
        [sys.executable, str(ENGINE)],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        text=True, bufsize=1,
    )
    for i in range(0, len(pcm), 640):
        chunk = pcm[i:i + 640]
        proc.stdin.write(json.dumps({
            "type": "audio",
            "audio_base64": base64.b64encode(chunk).decode(),
        }) + "\n")
        proc.stdin.flush()
    proc.stdin.write(json.dumps({"type": "finish"}) + "\n")
    proc.stdin.flush()

    final = ""
    for line in proc.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        kind = event.get("type")
        if kind == "partial":
            print(event.get("text", ""), file=sys.stderr)
        elif kind == "final":
            final = event.get("text", "")
        elif kind == "error":
            print(event, file=sys.stderr)
    proc.wait(timeout=60)
    return final


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("wav", type=Path)
    args = ap.parse_args()
    text = transcribe(read_pcm(args.wav))
    print(text)
    return 0 if text else 1


if __name__ == "__main__":
    raise SystemExit(main())
