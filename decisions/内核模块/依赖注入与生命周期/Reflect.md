# Reflect

**父级**：[依赖注入与生命周期](./依赖注入与生命周期.md)

## 负责什么

服务访问的 Proxy、trace、reactive：`ctx.get()` 怎么拿到服务、调用怎么被追踪。

## 相关源码

`packages/cordis/src/reflect.ts`

## 讨论链

1. 起点：cordis 的 `ctx` 是一个 Proxy，普通属性读取要走服务解析。
2. 关键判断：服务查找不能是全局表——必须沿 fiber 链向上找，并遵守 isolate 标签。
3. 收敛：Proxy handler 拦截 get/set/has；服务实现存在 `reflect.store`，按 isolate label 分槽。

## 决定

1. **ctx 是 Proxy**：`get` / `set` / `has` 三个 trap 负责服务解析、写入、存在性判断。
2. **服务解析沿 fiber 链向上**：从当前 fiber 的 store 开始，逐级看 parent；遇到 `inject` 声明但服务不在当前 scope，报错；isolate 标签不一致则停止。
3. **`get(name, strict=true)`**：strict 时只返回提供者 fiber 处于 `ACTIVE` 的服务；`strict=false` 返回 PENDING 服务的值（TUI 用过这个绕过）。
4. **`provide(name, value, check)`**：注册服务，绑定到当前 fiber 的 effect；dispose 时删除并通知依赖者。
5. **`set` 只能由提供者调用**：`impl.fiber !== ctx.fiber` 时抛错。
6. **`accessor`**：定义计算属性（get/set hooks），随 fiber 注销。
7. **`mixin`**：把服务成员挂到 ctx（`ctx.on` → `ctx.events.on`），随 fiber 注销。
8. **`notify`**：服务变化时重新检查所有 inject 该服务的 fiber，触发 `_refresh`。
9. **trace / bind**：调用时把 `this` 和参数包成 traceable，供诊断用。
10. **notify 的 filter**：`notify(names, filter)` 只通知匹配 isolate scope 的 fiber；`internal/service` 事件带 filter 包装的 ctx。

## 验收

| # | 判据 |
|---|---|
| 1 | `ctx.get(name)` 能拿到当前 scope 的服务 |
| 2 | 不同 isolate scope 的同名服务互不可见 |
| 3 | `provide` 的 disposer 执行后，服务从 ctx 上消失 |
| 4 | `set` 只能由提供者调用，否则抛错 |
| 5 | `accessor` / `mixin` 随 fiber dispose 自动移除 |
| 6 | `get(name, false)` 能拿到 PENDING 服务的值（用于过渡态） |

## 与核心战略的关系

- P1：服务解析是内核机制
- P7：不做版本检查；服务按 name 解析，有实现就能拿
