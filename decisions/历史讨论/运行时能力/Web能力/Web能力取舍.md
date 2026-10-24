# Web 能力取舍

**父战略**：[Web能力](../../../历史讨论.md)

## 讨论链

1. 对比结果：`web-deepseek-api` 的 baseURL 与我们的 `websearch`/`webfetch` 是同一个 API；`web-search-deepseek` 是 Anthropic 兼容的 `/messages`，DSH 独有；`web-fetch-http` 是纯静态抓取。
2. 关键：DSH 的 `tool-web` 系统提示（外部数据不可信、引用 URL）是防提示注入的。
3. 收敛：保留 `web` + `web-deepseek-api` + `tool-web` + `web-fetch-http`；`web-search-deepseek` 先不启用。

## 决定

- 保留 `web` / `web-deepseek-api` / `tool-web`
- 保留 `web-fetch-http`（静态抓取不花 API 额度）
- `web-search-deepseek` 已挂载（entries id 204），是否保留待评估
- `websearch`/`webfetch` 脚本保留为命令行快捷方式
- `agent-browser` 保留，作为动态/交互补充
