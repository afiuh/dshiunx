# 接口包按依赖链 vendor

**父战略**：[框架来源](../历史讨论.md)

## 讨论链

1. npm 上这些接口包的最新版是 0.0.1/0.1.0，发布不完整。
2. 判断：vendor 后依赖链自洽，不碰 npm 旧版。
3. 收敛：按依赖链 vendor 到 workspace（0.2.1-rc.2 源码）。

## 决定

`dsh-fs`、`dsh-sandbox`、`dsh-shell`、`dsh-subprocess`、`dsh-compaction`、`dsh-attachment`、`dsh-spill`、`dsh-ptc-runtime`、`dsh-session-persistence`、`dsh-typert-protocol`、`dsh-user-approval`、`dsh-output-retention`、`dsh-timeout`、`dsh-scope`、`dsh-workspace`、`dsh-home-paths`、`dsh-http-proxy`、`dsh-util-time`、`dsh-anonymous-user-id`、`dsh-launch-environment`、`dsh-credentials`、`dsh-llm-deepseek`、`dsh-deepseek-llm-api-extensions`、`dsh-agent-preset-registry`、`dsh-app-boot` 等全部 vendor。
