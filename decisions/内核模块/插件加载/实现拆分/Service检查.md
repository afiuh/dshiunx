# Service检查

**父级**：[插件加载](../插件加载.md)

## 为什么需要

loader 条目未加载完时，依赖者保持 pending（await 拦截）。

## 准备怎么实现

### 宏观想法

loader 条目未加载完时，依赖者保持 pending（await 拦截）。

```
getTasks() → Service.check → pending
```

### 细节实现

1. `[Service.check]`：`config.await && this.getTasks().length` 返回 false（依赖者保持 pending）
2. `getTasks()` / `await()`：收集所有 entry 的 `_initTask` 和 `fiber.inertia`

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/index.ts:178`（`[Service.check]()`）
