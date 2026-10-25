#!/usr/bin/env python3
"""唤醒词归一化：ASR 开头近似“维叶莎”的三字词 → 精确“维叶莎”。"""

import sys

TARGET = "维叶莎"
ALIASES = {
    "维叶沙", "薇叶莎", "维耶莎", "伟叶莎", "卫叶莎",
    "维叶纱", "薇叶沙", "维业莎", "唯叶莎", "维娅莎",
}


def normalize(text: str) -> str:
    text = text.strip()
    if len(text) < 3:
        return text
    head = text[:3]
    # 白名单，或与目标共享至少 2 个字
    if head in ALIASES or sum(a == b for a, b in zip(head, TARGET)) >= 2:
        return TARGET + text[3:]
    return text


if __name__ == "__main__":
    print(normalize(sys.stdin.read()))
