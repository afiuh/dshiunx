# 事件系统

**父级**：[内核模块](../README.md)

## 负责什么

waterfall / parallel / serial / bail：插件之间怎么通信。

## 相关源码

`packages/cordis/src/events.ts`

## 决策

1. **5 种分发模式**：`emit` / `parallel` / `serial` / `bail` / `waterfall`。
2. **`emit`**：同步调用监听器，不 await；适合通知类事件。
3. **`parallel`**：await 所有监听器（并发）。
4. **`serial`**：按注册顺序 await，直到某个监听器返回 bail 值。
5. **`bail`**：同步调用，第一个非 null/false/undefined 的返回值停止。
6. **`waterfall`**：组合返回值——前一个监听器的返回值作为后一个的输入。
7. **`on` / `once`**：注册监听器，返回 disposer；随 owning fiber 自动注销。
8. **事件类型通过 `declare module` 扩展**：`interface Events { ... }`。
9. **监听器选项**：`global`（跨 scope）、`prepend`（插到最前）——loader 用它们做全局钩子。

## 验收

| # | 判据 |
|---|---|
| 1 | `emit` 不等待异步监听器 |
| 2 | `parallel` 等待全部完成 |
| 3 | `serial` 遇到 bail 停止 |
| 4 | `waterfall` 把返回值传给下一个 |
| 5 | `once` 只触发一次 |
| 6 | fiber dispose 后监听器自动移除 |
