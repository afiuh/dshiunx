# Service

**父级**：[依赖注入与生命周期](../README.md)

## 负责什么

Service 基类、生命周期符号、callable：一个“服务”是什么样。

## 相关源码

`packages/cordis/src/service.ts`

## 讨论链

1. 起点：cordis 用 Service 基类表达“在 ctx 上暴露命名 API 的插件”。
2. 关键判断：服务不是全局单例，而是**随 owning fiber 生命周期存在**的实例——fiber dispose，服务自动消失。
3. 收敛：构造即注册（`super(ctx, name)`），用符号扩展可选能力（init/check/invoke/config/extend）。

## 决定

1. **构造即注册**：`super(ctx, name)` 调用 `ctx.reflect.provide(name, self, check)`；服务随 owning fiber 自动注销。
2. **服务是命名 API**：`name` 是 ctx 上的查找键；同名服务在 isolate 作用域内解析。
3. **可选能力用符号表达**：
   - `Service.init`：构造后运行的初始化方法（class plugin）
   - `Service.check`：可用性谓词，`provide` 时传入
   - `Service.invoke`：让服务实例可调用（如 `ctx.logger()`）
   - `Service.config`：intercept 配置的幻影类型
   - `Service.extend`：派生一个扩展实例，不修改原实例
4. **isolate 语义**：`[symbols.filter]` 比较 `ctx[isolate][name]` 是否一致；不同 scope 的同名服务互不可见。
5. **intercept 配置合并**：`resolveConfig` 沿原型链收集祖先配置，**根先、base 前、head 后**；有 `Config.merge` 用之，否则浅合并。
6. **不做版本检查**：Service 注册不看版本号（核心战略 P7）。
7. **跨代理 instanceof**：`Service[Symbol.hasInstance]` 沿 constructor 原型链查找，代理对象也能正确判断。

## 验收

| # | 判据 |
|---|---|
| 1 | `super(ctx, name)` 后，`ctx.get(name)` 立刻可见 |
| 2 | owning fiber dispose 后，服务从 ctx 上消失 |
| 3 | 不同 isolate scope 的同名服务互不可见 |
| 4 | 带 `[Service.invoke]` 的服务可调用 |
| 5 | intercept 配置按祖先顺序合并（根先） |
| 6 | 派生实例（`[Service.extend]`）不修改原实例 |

## 与核心战略的关系

- P1：Service 是内核机制（所有插件都用），不属于业务插件
- P7：注册不做版本验证，有 `name` + 构造即接
