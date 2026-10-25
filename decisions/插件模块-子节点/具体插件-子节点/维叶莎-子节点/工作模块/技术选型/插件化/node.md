# 插件化

**父模块**：`../node.md`

## 为什么需要

把贾维斯现有 Python 代码解耦成 dshiunx 插件组。不先定切分/边界/语言，执行时会滑回"一个包塞全部"或"跨进程乱调"。

## 切分原则（引用 dshiunx 插件干净度）

每个插件必须过 8 条判据（dshiunx `decisions/插件模块-子节点/插件干净度.md`）：

1. 单一能力
2. 显式依赖（`inject`）
3. 无全局状态
4. 可独立卸载（`ctx.effect`）
5. 可替换
6. 无版本元数据
7. 可裁剪（不装仍启动）
8. 不预设用法

## 语言边界

| 插件 | 语言 | 理由 |
|---|---|---|
| `jarvis-voice` | TS 插件 + Python sidecar | wetype ASR / Edge-TTS 的 Python 生态；sidecar 可替换 |
| `jarvis-notes` | TS | `rg` + `fs`，逻辑简单 |
| `jarvis-tasks` | TS | `fs` |
| `jarvis-dispatch` | TS | 与 dshiunx agent/session 集成 |
| `jarvis-system` | TS | `hyprctl` / `child_process` |
| `jarvis-memory` | TS | `node:sqlite` |
| `jarvis-audit` | TS | `fs` + jsonl |
| `jarvis-chat` | 待定 | 见「待确认」 |

## 插件清单

| 插件 | 对应决策节点 | 提供 |
|---|---|---|
| [jarvis-voice](./voice.md) | 语音模块 | `ctx.jarvisVoice.transcribe / speak` |
| [jarvis-notes](./notes.md) | 数据信息管理/笔记库读写 | `ctx.jarvisNotes.search / read / write` |
| [jarvis-tasks](./tasks.md) | 数据信息管理/事务录入 | `ctx.jarvisTasks.add` |
| [jarvis-dispatch](./dispatch.md) | 执行能力/任务分配 | `ctx.jarvisDispatch.run` |
| [jarvis-system](./system.md) | 执行能力/系统控制 | `ctx.jarvisSystem.open / exec` |
| [jarvis-memory](./memory.md) | 数据信息管理/记忆存储 | `ctx.jarvisMemory.add / search` |
| [jarvis-audit](./audit.md) | 数据信息管理/审核追溯 | `ctx.jarvisAudit.record / backup` |
| [参考插件](./参考插件.md) | — | 民间插件清单（记忆/桌面控制/审核），优先复用 |

## 依赖关系

```
jarvis-voice   → 无（sidecar）
jarvis-notes   → ctx.fs? / 直接 fs
jarvis-tasks   → 无
jarvis-dispatch→ ctx.agent / ctx.sessions（dshiunx）
jarvis-system  → 无（child_process）
jarvis-memory  → 无（node:sqlite）
jarvis-audit   → 无（fs）
jarvis-chat    → ctx.agent（dshiunx）
```

## 验证

- 每个插件：一条真实任务走通
- 卸载任一插件，`dx` 仍启动（判据 7）
- `dx -p` 仍能跑（可裁剪）
- 插件之间不 import（判据 2）

## 已定（2026-10-25 用户拍板）

1. **不单独做 `jarvis-chat`**：与 dshiunx 自身的智能体/对话重复；对话由 dshiunx agent 提供，渲染模块只负责展示。
2. **`jarvis-dispatch` 依赖 dshiunx 自身的智能体**（`ctx.agent`），不 spawn `pi`。
3. **`jarvis-voice` 接口粒度**：`transcribe(pcm)` + `speak(text)`；录音/触发归调用方。
4. **`jarvis-memory` 暂不做**：DSH 可能已有专门的记忆插件，先查源码再定。
5. **笔记写入**：写入即记录 + 可回滚（不另做审核队列）；DSH 源码里有此功能，待抽取。
