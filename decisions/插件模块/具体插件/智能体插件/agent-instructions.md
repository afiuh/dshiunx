# agent-instructions

**父级**：[智能体插件](./README.md)

## 职责

项目指令（AGENTS.md）加载：从 cwd 向上查找，注入系统提示。

## 配置项

| 字段 | 我们的配置 |
|---|---|
| `maxBytes` | `65536` |

## 行为

1. 从 cwd 向上查找 `AGENTS.md`（到根目录）
2. 文件触碰追踪：`read` / `write` / `edit` 的 `file_path` 记录
3. 指令版本缓存（`InstructionVersionCache`）
4. 用户消息的 context payload 去重（`sameContextPayload`）

## 决策

1. `maxBytes: 65536`（与 DSH 一致）
2. base + preset 重复挂载（与 DSH 一致）

## 与 DSH 一致

- DSH 的 base：`maxBytes: 65536`
- DSH 的 preset 也有（重复，正常）
