# 插件分类

**父级**：[插件基础设施](../README.md)

## 负责什么

插件按什么维度分类，每类的边界和契约。

## 决策

1. **分类维度**（按职责）：
   - **运行时**：agent / agent-loop / llm / session / storage / tools（系统核心）
   - **工具**：tool-fs / tool-bash / tool-web / subagent / subprocess（给 agent 用）
   - **界面**：tui / tui-* / LayoutTree / Web renderer（呈现）
   - **角色**：persona / preset（配置）
   - **装配**：bundle / profile / entries（组合）

2. **分类不是隔离**：同一类插件可以互相依赖（工具依赖运行时服务），分类只是“职责归类”，不是“依赖边界”。

3. **preset 不是插件分类**：Standard / PTC / Minimal / Creator 是“插件组合的预设”，不是“插件类型”。

4. **角色属于配置/插件层**（历史决策）：persona 是插件，不是内核。

## 边界

| 类别 | 边界 |
|---|---|
| 运行时 | 提供系统级服务（agent / llm / session） |
| 工具 | 只给 agent 调用，不直接服务其他插件 |
| 界面 | 只读状态 + 渲染，不修改业务 |
| 角色 | 只影响提示词，不影响逻辑 |
| 装配 | 只组合插件，不实现功能 |
