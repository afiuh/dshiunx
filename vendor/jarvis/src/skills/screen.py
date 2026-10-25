#!/usr/bin/env python3
"""屏幕：按需截图，交给 pi 读取图片。"""

import subprocess


def capture(path: str = "/tmp/jarvis-screen.png") -> str:
    subprocess.run(["grim", path], check=True, capture_output=True, text=True)
    return path
