# Web 能力

**父战略**：[运行时能力](../../历史讨论.md)

## 讨论链

1. 用户要求对比 DSH 的 web 模块和我们已有的 `websearch`/`webfetch`/`agent-browser`。
2. 发现：`web-deepseek-api` 与我们的 `websearch`/`webfetch` 是同一个 API；`agent-browser` 是 DSH 没有的。
3. 收敛：优先用 DSH 的 `tool-web`（有防提示注入的系统提示），保留 `agent-browser` 作为动态补充。

## 子决策

- [Web能力取舍](./Web能力取舍.md)
- [agent-browser独立插件](./agent-browser独立插件.md)
