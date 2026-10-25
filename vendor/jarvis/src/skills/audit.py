#!/usr/bin/env python3
"""审核/追溯：操作日志 + 写入前备份（阶段 6 最小版）。"""

import json
import shutil
from datetime import datetime
from pathlib import Path

BASE = Path.home() / ".local/share/jarvis"
AUDIT = BASE / "audit.jsonl"
BACKUPS = BASE / "backups"


def record(kind: str, detail) -> None:
    BASE.mkdir(parents=True, exist_ok=True)
    with AUDIT.open("a") as f:
        f.write(json.dumps({
            "ts": datetime.now().isoformat(timespec="seconds"),
            "kind": kind,
            "detail": detail,
        }, ensure_ascii=False) + "\n")


def backup(path: Path) -> Path | None:
    if not path.exists():
        return None
    BACKUPS.mkdir(parents=True, exist_ok=True)
    dest = BACKUPS / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{path.name}"
    shutil.copy2(path, dest)
    return dest
