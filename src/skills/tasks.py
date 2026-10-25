#!/usr/bin/env python3
"""事务捕获：语音/文本 → 待整理事务 inbox（阶段 2，先捕获不自动归档）。"""

from datetime import datetime
from pathlib import Path

TASK_INBOX = (
    Path.home()
    / "obsidian-笔记/好好生活/事务信息管理系统/具体安排工作区/jarvis-inbox.md"
)


def add(text: str) -> str:
    TASK_INBOX.parent.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    with TASK_INBOX.open("a") as f:
        f.write(f"- [ ] {text.strip()}（捕获 {ts}）\n")
    return str(TASK_INBOX)
