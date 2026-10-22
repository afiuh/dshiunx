# 日志

**父级**：[内核模块](../README.md)

## 负责什么

`ctx.logger`：级别、格式化、导出。

## 相关源码

`packages/cordis/src/logger.ts`

## 决策

1. **4 个级别**：`error` / `warn` / `info` / `debug`。
2. **结构化 Message**：level、name、参数、时间戳。
3. **Exporter 接口**：`levels`（过滤）、`formatters`（格式化）、`export(message)`（输出）。
4. **占位符格式化**：`%C` 等，`Logger.format()` 内置。
5. **命名 logger**：`ctx.logger(name)` 返回带名字的 logger。
6. **logger 是 Service**：随 owning fiber 注销。
7. **不做版本检查**（P7）：logger 只按名字解析。

## 验收

| # | 判据 |
|---|---|
| 1 | `ctx.logger('x').info(...)` 输出带名字的日志 |
| 2 | Exporter 能按 level 过滤 |
| 3 | 占位符被正确替换 |
| 4 | fiber dispose 后 logger 失效 |
