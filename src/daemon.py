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
from wake_normalize import normalize, is_wake_only  # noqa: E402

STATE = Path("/tmp/weiyesha-state.json")
TEMP_FILES = [Path("/tmp/jarvis-reply.mp3"), Path("/tmp/jarvis-screen.png")]
TRIGGER = threading.Event()
STOP = threading.Event()


def cleanup_temp() -> None:
    for p in TEMP_FILES:
        p.unlink(missing_ok=True)


def set_state(state: str) -> None:
    STATE.write_text(json.dumps({"state": state, "ts": time.time()}, ensure_ascii=False))


def on_signal(signum, frame) -> None:
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
    reply = jarvis.ask_pi(text)
    print(reply, flush=True)
    if speak:
        set_state("speaking")
        jarvis.speak(reply)
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
    signal.signal(signal.SIGTERM, lambda *_: STOP.set())
    cleanup_temp()
    set_state("armed")

    if args.text:
        process(args.text, not args.no_speak)
        return 0

    if not args.no_heartbeat:
        threading.Thread(target=heartbeat_loop, args=(args.detector_url, args.token), daemon=True).start()

    print("[daemon] armed; 发送 SIGUSR1 触发录音", flush=True)
    while not STOP.is_set():
        if args.once:
            TRIGGER.set()
        if not TRIGGER.wait(0.5):
            continue
        TRIGGER.clear()
        set_state("recording")
        pcm = record_utterance(args.threshold, args.silence, args.max_seconds)
        if not pcm:
            print("[daemon] 没有录音", file=sys.stderr)
            set_state("armed")
            if args.once:
                break
            continue
        text = normalize(transcribe(pcm))
        print(f"[daemon] 识别：{text}", file=sys.stderr)
        if not text:
            set_state("armed")
            if args.once:
                break
            continue
        if is_wake_only(text):
            # 两阶段：先叫名字，AI 回应后再录任务
            set_state("speaking")
            if args.no_speak:
                print("我在，请说", flush=True)
            else:
                jarvis.speak("我在，请说")
            set_state("recording")
            pcm2 = record_utterance(args.threshold, args.silence, args.max_seconds)
            text2 = normalize(transcribe(pcm2))
            print(f"[daemon] 任务：{text2}", file=sys.stderr)
            if text2:
                process(text2, not args.no_speak)
            else:
                set_state("armed")
        else:
            process(text, not args.no_speak)
        if args.once:
            break

    cleanup_temp()
    set_state("disarmed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
