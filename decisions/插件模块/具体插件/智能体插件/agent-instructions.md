# agent-instructions

**父级**：[智能体插件](./智能体插件.md)

## 为什么需要

项目指令（AGENTS.md）加载：从 cwd 向上查找，注入系统提示。

## 准备怎么实现

### 宏观想法

项目指令（AGENTS.md）**从 cwd 向上查找**——项目根可能有，子目录也可能有。

```
cwd → 向上找 AGENTS.md → 注入
```

**为什么向上**：项目指令在根目录，但 cwd 可能在子目录。

### 细节实现

1. `maxBytes: 65536`（与 DSH 一致）
2. base + preset 重复挂载（与 DSH 一致）
## 配置项

| 字段 | 我们的配置 |
|---|---|
| `maxBytes`（`src/index.ts`） | `65536` |

## 行为

### 发现（`files.ts`）

1. **项目根靠标记识别**：`projectRootMarkers` 默认 `['.git']`（`config.ts:11`），从 cwd 向上找到含标记的目录
2. **基线**：`ancestorChain(root, cwd)`（`files.ts:255`）—— 根到 cwd 的祖先链上每层的指令文件
3. **动态**：`descendantDirsBetween(root, touchedPath)`（`files.ts:276`）—— 工具触碰某文件后，加载"根 → 该文件"路径上的指令（不只是 cwd 向上）
4. **同目录多候选**：`['AGENTS.md', 'CLAUDE.md']`（`config.ts:12`）全部加载；同目录 trimmed 内容重复只留最早的候选（`dedupInstructionFilesByCandidateGroup`，`files.ts:430`）
5. **本地覆盖层**：`['AGENTS.local.md', 'CLAUDE.local.md']`（`config.ts:13`）在基础文件之后加载，同样按 trimmed 内容去重

### 两级字节上限

| 配置 | 默认 | 作用 |
|---|---|---|
| `maxBytes`（必填） | 我们的 `65536` | 一次渲染（基线或动态批次）的 UTF-8 上限；≤0 或非有限值 → 关闭加载 |
| `maxSourceBytes` | `1_048_576`（1MB） | 单个指令文件的读取上限；超过则忽略该文件 |

### 运行时

6. 文件触碰追踪：`read` / `write` / `edit` 的 `file_path` 记录
7. 指令版本缓存（`InstructionVersionCache`）
8. 用户消息的 context payload 去重（`sameContextPayload`）


## 边界

| | agent-instructions | system-prompt |
|---|---|---|
| 管什么 | 项目指令的**发现、读取、截断、去重** | 提示拼装与分区顺序 |
| 来源 | 文件系统（AGENTS.md / CLAUDE.md / .local.md） | 配置 + 各 provider 的 section |
| 输出 | 一段可注入的指令文本 | 完整系统提示 |

**不管**：文件系统访问本身（走 `ctx.fs`）、工具怎么报告触碰（工具）、指令内容的语义（写指令的人）。

## 硬约束

- `maxBytes: 65536`（超长截断）
- 向上查找直到根目录

## 验证

- 从含 `.git` 的目录向下到子目录运行，能加载根与沿途每层的 AGENTS.md（`ancestorChain`）
- 工具读了某个深路径文件后，该路径上的指令被加载（`descendantDirsBetween`）
- 同目录同时有 AGENTS.md 与 CLAUDE.md 且内容相同 → 只加载一份（trimmed 去重）
- `.local.md` 覆盖层在基础文件之后加载
- 单个文件超过 `maxSourceBytes` → 忽略，不报错
- 渲染超过 `maxBytes` → 截断（不是整批丢弃）

## 参考什么

`packages/dsh-agent-instructions/src/index.ts`
