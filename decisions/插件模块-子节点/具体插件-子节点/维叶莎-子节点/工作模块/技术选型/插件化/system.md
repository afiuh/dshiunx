# jarvis-system

**父模块**：`../node.md`

## 接口

- `ctx.jarvisSystem.open(target): Promise<string>` —— 打开应用/文件
- `ctx.jarvisSystem.exec(command): Promise<string>` —— 执行命令

## 依赖

- 无（`child_process`）
- 桌面：Hyprland（`hyprctl dispatch exec`）

## 边界

- 不做全屋控制
- 不二次确认（用户是技术人员），但要有记录（调 `jarvis-audit`）
- 不物理移动系统目录；敏感文件红线

## 验证

- `exec("echo hi")` → `hi`
- `open("~/obsidian-笔记")` → 打开

## 现有代码

`src/skills/system.py`。
