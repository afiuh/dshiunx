# Registry

**父级**：[依赖注入与生命周期](../依赖注入与生命周期.md)

## 为什么需要

`inject` / `provide` / `get`、插件注册、服务查找：把插件、fiber、服务组织起来。

## 准备怎么实现

### 宏观想法

插件注册表：插件形状 → runtime → fiber（`ctx.plugin()`）。

```
plugin 形状 → resolve → Runtime → Fiber
```

### 细节实现
## 讨论链

1. 起点：插件有三种形状（函数 / 类 / `{ apply }` 对象），需要统一注册。
2. 关键判断：同一个插件 callback 可以被多次挂载，但共享一个 runtime 记录。
3. 收敛：Registry 以 callback 为身份键，维护 `Runtime`（fibers 列表 + Config），每次 `plugin()` 创建一个新 fiber。


## 决定

1. **插件形状**：`function` / `class`（构造函数）/ `{ apply }` 对象；`resolve()` 统一成 callback。
2. **Runtime 以 callback 为键**：`fibers` 是该插件的所有存活实例；`Config` 是共享的 schema。
3. **`plugin(plugin, config)`**：解析形状 → 创建/复用 runtime → `new Fiber(...)`；返回可 await 的 fiber（`registry.ts:237`）。
4. **`inject(deps, callback)`**：`ctx.plugin({ inject, apply: callback })` 的简写（`registry.ts:176`）。
5. **`delete(plugin)`**：dispose 该插件的所有 fiber，删除 runtime。
6. **迭代接口**：`keys` / `values` / `entries` / `forEach`，供 loader 和诊断用。
7. **不做版本检查**：注册只看形状和 `apply`，不看版本号（P7）。
8. **uid 分配**：`counter` getter 每次读取自增（`registry.ts:207-208`），fiber uid 由此分配（根 fiber 为 0）。
9. **resolve 容错**：`plugin.apply` 可能抛错，`resolve` 用 try/catch 包住（`registry.ts:222`），返回 `undefined` 表示无效插件。

## 验收

| # | 判据 |
|---|---|
| 1 | 函数 / 类 / `{ apply }` 三种插件都能注册 |
| 2 | 同一插件多次 `plugin()` 产生多个 fiber，共享 runtime |
| 3 | `delete(plugin)` 后所有 fiber 被 dispose |
| 4 | `inject(deps, cb)` 在依赖就绪后运行 cb |
| 5 | 无效插件（无 apply）抛错 |
| 6 | 注册不做版本验证 |

## 与核心战略的关系

- P1：注册表是内核机制
- P7：有 `apply` 就能接，没有版本门槛

## 参考什么

`packages/cordis/src/registry.ts`
