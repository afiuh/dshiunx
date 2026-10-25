# jarvis-memory

**父模块**：`../node.md`

## 状态（2026-10-25）

**暂不做**。用户指出：**民间自己做的插件**（不是 DSH 官方、不是 DSH 源码）。
结论：先确认是哪个民间插件（名字/仓库），能复用就复用，不重复造。

**待确认**：民间记忆插件的具体来源。

## 接口

- `ctx.jarvisMemory.add(kind, content): Promise<void>`
- `ctx.jarvisMemory.search(query, limit?): Promise<string>`

## 依赖

- 无（`node:sqlite`）
- 存储：`~/.local/share/jarvis/memory.db`（可配置）

## 边界

- 不记隐私 / 一次性信息
- 不替代笔记库
- 不主动翻旧账
- **待确认**：与 dshiunx session/projection 的关系

## 验证

- 写入/检索通过
- 跨进程重启后仍可读

## 现有代码

`src/skills/memory.py`（SQLite `events(ts,kind,content)`）。
