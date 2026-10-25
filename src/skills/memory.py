#!/usr/bin/env python3
"""长期记忆：SQLite 事件记录 + 关键词检索（阶段 5 最小版）。"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB = Path.home() / ".local/share/jarvis/memory.db"


def _conn():
    DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB)
    c.execute("""CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        kind TEXT NOT NULL,
        content TEXT NOT NULL
    )""")
    return c


def add(kind: str, content) -> None:
    if not isinstance(content, str):
        content = json.dumps(content, ensure_ascii=False)
    with _conn() as c:
        c.execute("INSERT INTO events(ts, kind, content) VALUES (?,?,?)",
                  (datetime.now().isoformat(timespec="seconds"), kind, content))


def search(query: str, limit: int = 5) -> str:
    with _conn() as c:
        rows = c.execute(
            "SELECT ts, kind, content FROM events WHERE content LIKE ? ORDER BY id DESC LIMIT ?",
            (f"%{query}%", limit),
        ).fetchall()
    if not rows:
        return "没有相关记忆。"
    return "\n".join(f"- {ts} [{kind}] {content[:200]}" for ts, kind, content in rows)
