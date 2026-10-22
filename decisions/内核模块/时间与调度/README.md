# 时间与调度

**父级**：[内核模块](../README.md)

## 负责什么

`ctx.setTimeout` / `setInterval` / 防抖：生命周期与 HMR 的时间基础。

## 相关源码

`packages/cordis-plugin-timer/src/index.ts`

## 决策

1. **定时器绑定 fiber effect**：fiber dispose 时自动 `clearTimeout` / `clearInterval`。
2. **`timeout(cb, delay)`**：返回 dispose；`timeout(delay)`：返回 promise。
3. **`interval(cb, delay)`**：返回 dispose；`interval(delay)`：返回 async iterator。
4. **`throttle` / `debounce`**：基于 timeout 实现，同样绑定 effect。
5. **`setTimeout` / `setInterval`**：deprecated 别名，保留兼容。
6. **timer 是 Service**：`ctx.timer`，方法 mixin 到 ctx。
7. **不做版本检查**（P7）。

## 验收

| # | 判据 |
|---|---|
| 1 | fiber dispose 后定时器不再触发 |
| 2 | `timeout(delay)` 返回的 promise 在 fiber dispose 时 reject |
| 3 | `interval(delay)` 的 async iterator 在 dispose 时结束 |
| 4 | `debounce` 只在静默期后触发一次 |
