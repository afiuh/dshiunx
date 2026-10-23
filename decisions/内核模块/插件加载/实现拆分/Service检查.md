# Service检查

**父级**：[插件加载](../插件加载.md)

## 为什么需要

loader 条目未加载完时，依赖者保持 pending（await 拦截）。

## 准备怎么实现

### 宏观想法

loader 条目未加载完时，依赖它的插件**不能启动**（否则服务缺失）。所以 `Service.check` 返回 false，依赖者保持 pending。

```
loader 加载中 → getTasks() 非空 → Service.check = false → 依赖者 pending
加载完 → getTasks() 空 → check = true → 依赖者启动
```

**为什么这样**：不等的话，依赖者会拿到 undefined 服务，启动即失败。

### 细节实现

1. `[Service.check]`：`config.await && this.getTasks().length` 返回 false（依赖者保持 pending）
2. `getTasks()` / `await()`：收集所有 entry 的 `_initTask` 和 `fiber.inertia`

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/index.ts:178`（`[Service.check]()`）
