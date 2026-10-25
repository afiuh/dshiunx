#!/usr/bin/env python3
"""维叶莎常驻服务（阶段 1）：armed → 触发 → 录音 → ASR → 助手 → TTS；心跳给 detector。"""

import argparse
import json
import os
import signal
import subprocess
import sys
import threading
import time
from array import array
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "asr"))

import jarvis  # noqa: E402
from wetype_asr import transcribe  # noqa: E402

STATE = Path("/tmp/weiyesha-state.json")
_last_state = None
TEMP_FILES = [Path("/tmp/jarvis-reply.mp3"), Path("/tmp/jarvis-screen.png")]
TRIGGER = threading.Event()
WAKE = threading.Event()
STOP = threading.Event()


def cleanup_temp() -> None:
    for p in TEMP_FILES:
        p.unlink(missing_ok=True)


def notify(msg: str) -> None:
    try:
        subprocess.run(
            ["hyprctl", "notify", "-1", "2500", "0", f"维叶莎：{msg}"],
            capture_output=True, timeout=2,
        )
    except Exception:
        pass


def set_state(state: str) -> None:
    global _last_state
    STATE.write_text(json.dumps({"state": state, "ts": time.time()}, ensure_ascii=False))
    if state != _last_state:
        _last_state = state
        label = {
            "recording": "正在听…",
            "processing": "处理中…",
            "speaking": "回复中…",
        }.get(state)
        if label:
            notify(label)


def on_signal(signum, frame) -> None:
    if signum == signal.SIGUSR2:
        WAKE.set()
    else:
        TRIGGER.set()


def rms(pcm: bytes) -> float:
    if not pcm:
        return 0.0
    samples = array("h")
    samples.frombytes(pcm[: len(pcm) // 2 * 2])
    if not samples:
        return 0.0
    return (sum(s * s for s in samples) / len(samples)) ** 0.5


def record_utterance(threshold: int, silence: float, max_seconds: float) -> bytes:
    proc = subprocess.Popen(
        ["parec", "--format=s16le", "--rate=16000", "--channels=1"],
        stdout=subprocess.PIPE,
    )
    chunk = 3200  # 100ms
    buf = bytearray()
    speaking = False
    silent_for = 0.0
    started = time.monotonic()
    try:
        while not STOP.is_set():
            data = proc.stdout.read(chunk)
            if not data:
                break
            level = rms(data)
            if not speaking:
                if level > threshold:
                    speaking = True
                    buf.extend(data)
            else:
                buf.extend(data)
                if level <= threshold:
                    silent_for += 0.1
                    if silent_for >= silence:
                        break
                else:
                    silent_for = 0.0
            if time.monotonic() - started > max_seconds:
                break
    finally:
        proc.terminate()
        proc.wait(timeout=5)
    return bytes(buf)


def heartbeat_loop(url: str, token: str) -> None:
    import urllib.request
    failures = 0
    while not STOP.wait(10):
        try:
            req = urllib.request.Request(
                url.rstrip("/") + "/heartbeat",
                data=b"{}",
                headers={"X-Token": token, "Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(req, timeout=5).read()
            failures = 0
        except Exception:
            failures += 1
            if failures >= 3:
                print("[daemon] detector 不可达，退出", file=sys.stderr)
                STOP.set()
                return


def process(text: str, speak: bool) -> None:
    set_state("processing")
    try:
        reply = jarvis.ask_pi(text)
        print(reply, flush=True)
        notify(reply[:100])
        if speak:
            set_state("speaking")
            jarvis.speak(reply)
    except Exception as exc:
        print(f"[daemon] 处理失败：{exc}", file=sys.stderr)
        notify(f"处理失败：{exc}")
    finally:
        set_state("armed")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--detector-url", default="http://127.0.0.1:8387")
    ap.add_argument("--token", default=os.environ.get("JARVIS_TOKEN", "test"))
    ap.add_argument("--text", help="测试：直接处理文本，不录音")
    ap.add_argument("--once", action="store_true", help="只处理一次")
    ap.add_argument("--no-speak", action="store_true")
    ap.add_argument("--no-heartbeat", action="store_true")
    ap.add_argument("--threshold", type=int, default=500)
    ap.add_argument("--silence", type=float, default=1.2)
    ap.add_argument("--max-seconds", type=float, default=15)
    args = ap.parse_args()

    signal.signal(signal.SIGUSR1, on_signal)
    signal.signal(signal.SIGUSR2, on_signal)
    signal.signal(signal.SIGTERM, lambda *_: STOP.set())
    cleanup_temp()
    set_state("armed")

    if args.text:
        process(args.text, not args.no_speak)
        return 0

    if not args.no_heartbeat:
        threading.Thread(target=heartbeat_loop, args=(args.detector_url, args.token), daemon=True).start()

    print("[daemon] armed; SIGUSR1=直接录音，SIGUSR2=唤醒", flush=True)
    while not STOP.is_set():
        if args.once:
            TRIGGER.set()
        if WAKE.is_set():
            WAKE.clear()
            set_state("speaking")
            wake_reply = jarvis.ask_pi(
                "用户点击了唤醒按钮，表示要开始说话。"
                "用一句很短的话回应，表示你在听；不要执行任务、不要追问太多。"
            )
            print(wake_reply, flush=True)
            notify(wake_reply[:100])
            if not args.no_speak:
                try:
                    jarvis.speak(wake_reply)
                except Exception as exc:
                    print(f"[daemon] 唤醒回应失败：{exc}", file=sys.stderr)
                    notify(f"唤醒回应失败：{exc}")
            set_state("recording")
            pcm = record_utterance(args.threshold, args.silence, args.max_seconds)
            text = transcribe(pcm)
            print(f"[daemon] 任务：{text}", file=sys.stderr)
            if text:
                process(text, not args.no_speak)
            else:
                set_state("armed")
            continue
        if not TRIGGER.wait(0.2):
            continue
        TRIGGER.clear()
        set_state("recording")
        pcm = record_utterance(args.threshold, args.silence, args.max_seconds)
        if not pcm:
            print("[daemon] 没有录音", file=sys.stderr)
            set_state("armed")
            continue
        text = transcribe(pcm)
        print(f"[daemon] 识别：{text}", file=sys.stderr)
        if text:
            process(text, not args.no_speak)
        else:
            set_state("armed")

    cleanup_temp()
    set_state("disarmed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
