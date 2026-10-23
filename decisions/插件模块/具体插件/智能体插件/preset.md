# preset

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

| 包 | 职责 |
|---|---|
| `dsh-agent-preset` | preset 定义（插件组合） |
| `dsh-agent-preset-registry` | preset 注册表（管理 4 个 preset，`ctx.agentPresets`） |

## 准备怎么实现

### 宏观想法

4 个 preset 是**插件组合的预设**（Standard/PTC/Minimal/Creator）——不同场景用不同组合。

```
preset-registry → 4 个 preset → 插件列表
```

**为什么 4 个**：主力（Standard）/ 批量（PTC）/ 极简（Minimal）/ 改造（Creator）场景不同。

### 细节实现

1. 4 个 preset 与 DSH 一致（除 Windows PowerShell）
2. `tool-schedule` 在 standard/ptc/creator preset（不在宿主层）
3. preset 的 `isolate`：只隔离 `planMode` / `compaction` / `toolResultPruner` / `workflowEngine`
4. `agent-preset-registry` 的 `default: standard`
## 配置项

### `dsh-agent-preset`（`PresetDefinition`，`src/index.ts:9`）

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | ✅ | preset id（standard/ptc/minimal/creator） |
| `name` | — | 显示名 |
| `description` | — | 描述 |
| `order` | — | 排序 |
| `plugins` | ✅ | 插件列表 |

### `dsh-agent-preset-registry`（`src/index.ts:54`）

| 字段 | 默认 | 我们的配置 |
|---|---|---|
| `default` | 必填 | `standard` |
| `selectedDefault` | volatile | 未设置 |

## 四模式

| preset | order（`bundles/presets/*/cordis.patch.yml:5`） | 用途 | 工具集 |
|---|---:|---|---|
| Standard | 1 | 主力 | 全工具 |
| PTC | 2 | 批量任务 | 全工具 + `workflow-ptc` |
| Minimal | 3 | 极简 | bash + readImage + compaction |
| Creator | 4 | 改造 dshiunx | 全工具 + `tool-cordis` |


## 模式分析结论（来自历史讨论）

| preset | 适用场景 | 不适用 |
|---|---|---|
| Standard | **主力**（长会话、多阶段、用户主导设计、多工具链） | — |
| PTC | 批量数据（`run_code` / `workflow-ptc` / `tool-workflow`） | 日常对话 |
| Minimal | 极简测试（bash + readImage + compaction） | **日常长任务**（去掉工具指导/运行时上下文，理解能力不降但上下文支撑少） |
| Creator | 改造 dshiunx（`tool-cordis` + `plugin-manager` + 开发技能） | 日常使用 |

**关键区分**（来自历史讨论）：
- 理解能力由模型权重决定，模式改不了
- 理解表现由上下文/提示决定，模式能改
- Minimal 去掉的是“干扰”（工具指导/运行时上下文），不是“理解”

## 实验状态（未实施）

- 四模式实验：由用户亲自设计（`理解能力与Minimal实验.md`）
- 实验计划：A（纯 Minimal）/ B（Minimal + 协作契约）/ C（Standard）
- 测试问题集 v1：`decisions/Agent模式/test-questions/`

## 检查

- 包 diff 无差异
- preset 完整对比：standard 32/33、ptc 33/34、minimal 10/12、creator 33/34（差异都是 Windows PowerShell）

## 参考什么

## 已知限制：creator 的 `tool-cordis` 在 headless 里 waiting（2026-10-24）

**现象**：`verify-presets` 跑 `creator` 时 `tool-cordis: waiting for cordisInspect`。

**原因**：
- `tool-cordis` 的 `inject: ['tools', 'cordisInspect']`
- `cordisInspect` 由 `cordis-host-runner` / `cordis-client-runner` 提供
- 默认 headless bundle **不挂载** `cordis-host-runner`（DSH 也不挂载，`apps/` 里没有）
- `cordis-host-runner` 的 README："Host halves run in a `node:vm` realm; browser halves use the Client runner and approval UI"

**结论**：与 DSH 一致（DSH 的 creator 在 headless 里也会 waiting）。**暂时接受**。

**如果要补**：挂载 `cordis-host-runner`（提供 `cordisInspect`），让 creator 在 headless 也能用。
