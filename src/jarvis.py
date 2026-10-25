#!/usr/bin/env python3
"""Jarvis 阶段 0 最小闭环：文本/剪贴板 → 简单路由 → pi → Edge-TTS 晓晓 → 播放。"""

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HOME = Path.home()
EDGE = shutil.which("edge-tts") or str(HOME / ".local/bin/edge-tts")
PI = shutil.which("pi") or str(HOME / ".local/bin/pi")
PLAYER = shutil.which("mpv") or shutil.which("pw-play")
VOICE = "zh-CN-XiaoxiaoNeural"
LOG_DIR = HOME / ".local/share/jarvis/logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG = LOG_DIR / "stage0.jsonl"


def read_input(args: argparse.Namespace) -> str:
    if args.text:
        return " ".join(args.text).strip()
    if args.clipboard:
        return subprocess.check_output(["wl-paste", "--no-newline"], text=True).strip()
    return sys.stdin.read().strip()


def route(text: str) -> tuple[str, str]:
    """阶段 0：只接问答；其他能力明确返回未接入。"""
    for key, name in (("笔记", "笔记库读写"), ("事务", "事务录入"),
                      ("任务", "任务分配"), ("系统", "系统控制")):
        if key in text:
            return "placeholder", f"阶段 0 还没接{name}；目前只做问答。"
    return "pi", ask_pi(text)


def ask_pi(text: str) -> str:
    proc = subprocess.run(
        [PI, "-p", text],
        capture_output=True, text=True, timeout=180,
    )
    out = (proc.stdout or "").strip()
    if not out:
        out = (proc.stderr or "").strip() or "pi 没有返回内容。"
    return out


def speak(text: str) -> None:
    if not PLAYER:
        print("[jarvis] 没有播放器（mpv/pw-play），跳过播放", file=sys.stderr)
        return
    out = Path(tempfile.gettempdir()) / "jarvis-reply.mp3"
    subprocess.run(
        [EDGE, "--voice", VOICE, "--text", text, "--write-media", str(out)],
        check=True,
    )
    subprocess.run([PLAYER, "--no-video", "--really-quiet", str(out)], check=False)


def main() -> int:
    parser = argparse.ArgumentParser(description="Jarvis 阶段 0 最小闭环")
    parser.add_argument("text", nargs="*", help="直接给文本；不传则读 stdin")
    parser.add_argument("--clipboard", action="store_true", help="从剪贴板读文本")
    parser.add_argument("--no-speak", action="store_true", help="只打印，不播放")
    args = parser.parse_args()

    text = read_input(args)
    if not text:
        print("没有输入文本。", file=sys.stderr)
        return 2

    kind, reply = route(text)
    record = {
        "ts": dt.datetime.now().isoformat(timespec="seconds"),
        "input": text,
        "route": kind,
        "reply": reply,
    }
    with LOG.open("a") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(reply)
    if not args.no_speak:
        speak(reply)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
