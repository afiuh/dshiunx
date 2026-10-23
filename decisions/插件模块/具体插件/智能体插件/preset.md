# preset（四模式）

**父级**：[智能体插件](./README.md)

## 职责

| 包 | 职责 |
|---|---|
| `dsh-agent-preset` | preset 定义（插件组合） |
| `dsh-agent-preset-registry` | preset 注册表（管理 4 个 preset） |

## 四模式

| preset | 用途 | 工具集 |
|---|---|---|
| Standard | 主力 | 全工具 |
| PTC | 批量任务 | 全工具 + `workflow-ptc` |
| Minimal | 极简 | bash + readImage + compaction |
| Creator | 改造 dshiunx | 全工具 + `tool-cordis` |

## 决策

1. 4 个 preset 与 DSH 一致（除 Windows PowerShell）
2. `tool-schedule` 在 standard/ptc/creator preset（不在宿主层）
3. preset 的 `isolate`：只隔离 `planMode` / `compaction` / `toolResultPruner` / `workflowEngine`

## 检查

- 包 diff 无差异
- preset 完整对比：standard 32/33、ptc 33/34、minimal 10/12、creator 33/34（差异都是 Windows PowerShell）
