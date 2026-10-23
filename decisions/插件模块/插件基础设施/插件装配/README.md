# 插件装配

**父级**：[插件基础设施](../README.md)

## 负责什么

插件怎么组合成系统：profile、entries、按需加载、裁剪、预设。

## 决策

1. **profile**：第一版一个 `profiles/default/`（历史决策）。
2. **entries.yml**：配置树，所有插件通过 Include 挂载（统一挂载）。
3. **按需加载**：`disabled` 条件（`!!js` 表达式）+ loader 的 `create` / `remove`。
4. **裁剪**：不需要的插件直接删（entries 条目），不留 disabled。
5. **预设**：preset（Standard / PTC / Minimal / Creator）是“插件组合的预设”，通过 `agent-preset` 挂载。
6. **启动链路**：见 [启动链路](../启动链路/README.md)。

## 与 DSH 的差异

| | DSH | 我们 |
|---|---|---|
| 装配 | bundle / patch 分层 | 单一 entries.yml（统一挂载） |
| 代价 | 配置分散 | 根级服务需要特殊处理（`ctx.root` 补偿，已回滚） |
