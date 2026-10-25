#!/usr/bin/env python3
"""唤醒词归一化：ASR 开头三字拼音首字母为 w/y/s → 精确“维叶莎”。"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "vendor"))

from pypinyin import lazy_pinyin, Style  # noqa: E402

TARGET = "维叶莎"


def first_letters(text: str) -> str:
    return "".join(lazy_pinyin(text, style=Style.FIRST_LETTER))


def normalize(text: str) -> str:
    text = text.strip()
    if len(text) < 3:
        return text
    head = text[:3]
    if first_letters(head) == "wys":
        return TARGET + text[3:]
    return text


if __name__ == "__main__":
    print(normalize(sys.stdin.read()))
