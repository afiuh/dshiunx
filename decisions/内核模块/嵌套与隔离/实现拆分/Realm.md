# Realm

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 要做什么

realm 的创建/合并/垃圾回收。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`（realm 逻辑）

## 决策

1. **realm 垃圾回收**（`isolate.ts:155`）：`loader/partial-dispose` 时，若没有 entry 再引用某个 label，删除该 realm；realm 空了就删 label
2. **`getTasks()` / `await()`**：收集所有 entry 的 `_initTask` 和 `fiber.inertia`；loader 的 `Service.check` 用它做 `await` 拦截（条目未加载完时依赖者保持 pending）
