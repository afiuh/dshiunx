#!/usr/bin/env python3
"""系统控制：打开应用/文件、执行命令（阶段 4，用户负责）。"""

import subprocess


def open_target(target: str) -> str:
    subprocess.run(["hyprctl", "dispatch", "exec", target], capture_output=True, text=True)
    return f"已尝试打开：{target}"


def run_command(cmd: str) -> str:
    proc = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    out = (proc.stdout or proc.stderr or "").strip()
    return out[:2000] or f"命令退出码 {proc.returncode}"
