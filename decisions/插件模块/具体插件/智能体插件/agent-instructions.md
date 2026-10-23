# agent-instructions

**父级**：[智能体插件](./README.md)

## 职责

项目指令（AGENTS.md）加载：从 cwd 向上查找。

## 决策

1. `maxBytes: 65536`（与 DSH 一致）
2. base + preset 重复挂载（与 DSH 一致）

## 与 DSH 一致

- DSH 的 base：`maxBytes: 65536`
- DSH 的 preset 也有（重复，正常）
