---
name: jarvis-system
description: 贾维斯系统控制 skill——打开应用/文件、执行命令、窗口/媒体/音量、截图；本机 Arch+Hyprland；按用户指令执行，不物理移动系统目录，敏感文件红线。
---

# jarvis-system（系统控制）

## 何时用

用户要打开应用/文件、执行命令、控制窗口/媒体/音量、截图。

## 本机

- Arch Linux + Hyprland + PipeWire；
- 应用启动：`hyprctl dispatch exec <命令>`；
- 文件：`xdg-open <路径>`；
- 音量：`wpctl`；
- 亮度：`brightnessctl`；
- 截图：`grim /tmp/jarvis-screen.png`。

## 执行

- 按用户指令执行；用户负责；
- 不做二次确认（用户是技术人员）；
- 执行结果/错误如实返回；
- 有记录（audit）；
- 破坏性命令（删除/覆盖/改系统配置）先确认，除非用户明确说直接做。

## 红线

- 不物理移动/删除系统目录（`/usr`、`/etc`、`/var`、`/boot`、`/opt`）；
- 不读不写敏感文件：`~/.git-credentials`、`~/.dev-sidecar/*.key.pem`、`/etc/shadow`；
- 不泄露 token/密钥；
- 不执行与用户指令无关的命令。

## 验证

- 应用/文件真的打开；
- 命令有输出/退出码；
- 失败就报告，不编成功。
