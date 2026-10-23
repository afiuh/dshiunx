# persona

**父级**：[智能体插件](./README.md)

## 职责

角色/人格：给系统提示加 prefix。

## 决策

1. 角色属于配置/插件层（历史决策）
2. `personaPrefix: ''`（默认，无角色）
3. 换角色 = 改配置或加 persona 插件

## 与 DSH 一致

- DSH 的 base：`personaPrefix: ''`
- preset 里的 persona：minimal 用 `'You are a helpful software engineer assistant.'`
