#!/usr/bin/env python3
"""任务分配：把长任务交给 pi 对话（新会话或指定会话）。"""

import subprocess


def run(prompt: str, session: str | None = None) -> str:
    cmd = ["pi", "--session", session, "-p", prompt] if session else ["pi", "-p", prompt]
    proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    out = (proc.stdout or "").strip()
    if not out:
        out = (proc.stderr or "").strip() or "pi 没有返回内容。"
    return out
