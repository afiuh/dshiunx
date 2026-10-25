# jarvis-notes

**父模块**：`../node.md`

## 接口

- `ctx.jarvisNotes.search(query, limit?): Promise<Result[]>`
- `ctx.jarvisNotes.read(path): Promise<string>`
- `ctx.jarvisNotes.write(path, content, mode?): Promise<string>`

## 依赖

- 无 dshiunx 服务依赖（`rg` + `fs`）
- 笔记库根：`~/obsidian-笔记`（可配置）

## 边界

- 路径限制在笔记库内（`_safe`）
- 写入默认 `草稿集/AI草稿/jarvis-inbox.md`
- 写入前备份、写入后记录（调 `jarvis-audit`，可选依赖）
- 不静默覆盖

## 验证

- 搜"思维元控制"返回结果
- 写入 inbox 成功
- 越界路径被拒绝

## 现有代码

`src/skills/notes.py`（`search` / `read` / `write`）。
