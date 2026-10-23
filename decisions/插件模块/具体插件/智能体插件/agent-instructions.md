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
## 配置项

| 字段 | 我们的配置 |
|---|---|
| `maxBytes`（`src/index.ts`） | `65536` |

## 行为（`src/index.ts:87`）

1. 从 cwd 向上查找 `AGENTS.md`（到根目录）
2. 文件触碰追踪：`read` / `write` / `edit` 的 `file_path` 记录
3. 指令版本缓存（`InstructionVersionCache`）
4. 用户消息的 context payload 去重（`sameContextPayload`）

## 决策

1. `maxBytes: 65536`（与 DSH 一致）
2. base + preset 重复挂载（与 DSH 一致）

## 边界

| | agent-instructions | system-prompt |
|---|---|---|
| 管什么 | 项目指令（AGENTS.md） | 提示拼装 |
| 来源 | 文件系统 | 配置 |

## 硬约束

- `maxBytes: 65536`（超长截断）
- 向上查找直到根目录

## 参考什么

`packages/dsh-agent-instructions/src/index.ts`
