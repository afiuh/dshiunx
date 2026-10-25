#!/usr/bin/env python3
"""Jarvis 阶段 0 最小闭环：文本/剪贴板/语音 → 简单路由 → pi → Edge-TTS 晓晓 → 播放。"""

import argparse
import datetime as dt
import json
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HOME = Path.home()
EDGE = shutil.which("edge-tts") or str(HOME / ".local/bin/edge-tts")
PI = shutil.which("pi") or str(HOME / ".local/bin/pi")
PLAYER = shutil.which("mpv") or shutil.which("pw-play")
VOICE = "zh-CN-XiaoxiaoNeural"
LOG_DIR = HOME / ".local/share/jarvis/logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG = LOG_DIR / "stage0.jsonl"
SYSTEM_PROMPT = Path(__file__).resolve().parent.parent / "config/jarvis_system.md"

sys.path.insert(0, str(Path(__file__).resolve().parent / "asr"))
from wetype_asr import transcribe  # noqa: E402


def read_input(args: argparse.Namespace) -> str:
    if args.voice:
        pcm = record_pcm(args.seconds)
        text = transcribe(pcm)
        if not text:
            print("[jarvis] 没识别到文字。", file=sys.stderr)
            return ""
        print(f"[jarvis] 识别：{text}", file=sys.stderr)
        return text
    if args.text:
        return " ".join(args.text).strip()
    if args.clipboard:
        return subprocess.check_output(["wl-paste", "--no-newline"], text=True).strip()
    return sys.stdin.read().strip()


def record_pcm(seconds: float | None) -> bytes:
    input("按 Enter 开始录音...")
    proc = subprocess.Popen(
        ["parec", "--format=s16le", "--rate=16000", "--channels=1"],
        stdout=subprocess.PIPE,
    )
    if seconds:
        time.sleep(seconds)
    else:
        input("录音中，按 Enter 停止...")
    proc.terminate()
    pcm, _ = proc.communicate(timeout=5)
    return pcm


def route(text: str) -> tuple[str, str]:
    """阶段 0/1：问答 + 笔记库基础读写。"""
    if "记忆" in text:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import memory
        q = text.split("：", 1)[-1] if "：" in text else text.replace("记忆", "", 1)
        return "memory", memory.search(q.strip())
    if "笔记" in text:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import notes
        if any(k in text for k in ("查", "搜索", "找")):
            q = text
            for k in ("查笔记", "搜索笔记", "找笔记", "查一下", "搜索", "查找"):
                q = q.replace(k, "")
            return "notes_search", notes.format_search(notes.search(q.strip()))
        if any(k in text for k in ("记笔记", "写笔记", "追加")):
            content = text.split("：", 1)[-1] if "：" in text else text
            rel = notes.write(str(notes.INBOX.relative_to(notes.VAULT)), content)
            return "notes_write", f"已写入 {rel}"
        if any(k in text for k in ("读笔记", "打开笔记")):
            rel = text.replace("读笔记", "").replace("打开笔记", "").strip()
            try:
                return "notes_read", notes.read(rel)[:3000]
            except Exception as exc:
                return "notes_read", f"读取失败：{exc}"
    if "事务" in text:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import tasks
        content = text.split("：", 1)[-1] if "：" in text else text
        rel = tasks.add(content)
        return "task_add", f"已记录到 {rel}"
    if "任务" in text:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import pi_task
        prompt = text.split("：", 1)[-1] if "：" in text else text.replace("任务", "", 1)
        return "pi_task", pi_task.run(prompt.strip())
    if "系统" in text:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import system
        if "打开" in text:
            target = text.split("打开", 1)[-1].strip()
            return "system_open", system.open_target(target)
        if "执行" in text:
            cmd = text.split("执行", 1)[-1].strip()
            return "system_run", system.run_command(cmd)
    return "pi", ask_pi(text)


def ask_pi(text: str) -> str:
    proc = subprocess.run(
        [PI, "--no-context-files", "--no-skills",
         "--system-prompt", str(SYSTEM_PROMPT), "-p", text],
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
    parser.add_argument("--voice", action="store_true", help="录音 → wetype ASR → 回复")
    parser.add_argument("--seconds", type=float, default=None, help="录音秒数；不填则按 Enter 停止")
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
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent / "skills"))
        import memory
        memory.add("interaction", record)
    except Exception:
        pass

    print(reply)
    if not args.no_speak:
        speak(reply)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
