#!/usr/bin/env python3
"""笔记库基础技能：搜索/读取/写入（阶段 1，先关键词，不接 RAG）。"""

import subprocess
from pathlib import Path

VAULT = Path.home() / "obsidian-笔记"
INBOX = VAULT / "草稿集/AI草稿/jarvis-inbox.md"


def _safe(path: str) -> Path:
    p = (VAULT / path).resolve()
    if not str(p).startswith(str(VAULT.resolve())):
        raise ValueError("路径越出笔记库")
    return p


def search(query: str, limit: int = 5) -> list[dict]:
    proc = subprocess.run(
        ["rg", "-l", "--glob", "*.md", "-i", query, str(VAULT)],
        capture_output=True, text=True,
    )
    files = [f for f in proc.stdout.splitlines() if f][:limit]
    results = []
    for f in files:
        g = subprocess.run(
            ["rg", "-n", "-i", "-m", "1", query, f],
            capture_output=True, text=True,
        )
        line = g.stdout.strip().splitlines()[0] if g.stdout.strip() else ""
        results.append({
            "path": str(Path(f).relative_to(VAULT)),
            "snippet": line[:200],
        })
    return results


def format_search(results: list[dict]) -> str:
    if not results:
        return "没找到相关笔记。"
    lines = [f"找到 {len(results)} 篇："]
    for r in results:
        lines.append(f"- {r['path']}：{r['snippet']}")
    return "\n".join(lines)


def read(path: str) -> str:
    return _safe(path).read_text()


def write(path: str, content: str, mode: str = "append") -> str:
    p = _safe(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if mode == "overwrite":
        p.write_text(content)
    else:
        with p.open("a") as f:
            f.write(content + "\n")
    return str(p.relative_to(VAULT))
