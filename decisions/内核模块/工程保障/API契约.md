# 内核 API 契约

**父级**：[工程保障](../README.md)

## 稳定 API（承诺不变）

### Context

| API | 语义 |
|---|---|
| `ctx.get(name, strict?)` | 读服务；`strict=true` 只返回 ACTIVE 服务 |
| `ctx.set(name, value)` | 改服务（仅提供者可调用） |
| `ctx.provide(name, value)` | 注册服务，返回 disposer |
| `ctx.accessor(name, options)` | 计算属性（get/set hooks） |
| `ctx.mixin(source, keys)` | 把服务成员挂到 ctx |
| `ctx.extend(meta)` | 子上下文（原型继承，不改父） |
| `ctx.isolate(name, label?)` | 隔离服务 scope |
| `ctx.intercept(name, config)` | 服务配置拦截 |
| `ctx.effect(execute, label?)` | 注册清理（LIFO） |
| `ctx.inject(deps, callback)` | 依赖就绪后执行 |
| `ctx.plugin(plugin, config?)` | 加载插件 |
| `ctx.root` | 根上下文 |
| `ctx.baseUrl` | 模块解析基准 |

### Service

| API | 语义 |
|---|---|
| `super(ctx, name)` | 构造即注册，随 fiber 注销 |
| `Service.init` | 构造后运行的初始化方法 |
| `Service.check` | 可用性谓词 |
| `Service.invoke` | 可调用服务 |
| `Service.config` | intercept 配置幻影类型 |
| `Service.extend` | 派生实例 |
| `resolveConfig(base?, head?)` | intercept 配置合并（根先） |

### Fiber

| API | 语义 |
|---|---|
| `fiber.state` | `PENDING / LOADING / ACTIVE / FAILED / DISPOSED / UNLOADING` |
| `fiber.dispose()` | 卸载（await 清理） |
| `fiber.await()` | 等待结算，重抛启动错误 |
| `fiber.update(config)` | 更新配置（可能重建） |
| `fiber.effect(...)` | 同 `ctx.effect` |

### Events

| API | 语义 |
|---|---|
| `ctx.emit(name, ...args)` | 同步，不等待异步监听器 |
| `ctx.parallel(name, ...args)` | 并发 await，错误聚合成 `AggregateError` |
| `ctx.serial(name, ...args)` | 顺序 await，遇到 bail 值停止 |
| `ctx.bail(name, ...args)` | 同步，遇到 bail 值停止 |
| `ctx.waterfall(name, ...args, next)` | 组合，`next` 是最后一个参数 |
| `ctx.on(name, listener, options?)` | 监听，返回 disposer |
| `ctx.once(name, listener, options?)` | 只监听一次 |

**bail 语义**：任何非 `null` / `false` / `undefined` 的返回值都会中断；监听器必须显式返回 `undefined` 才继续。

### Loader

| API | 语义 |
|---|---|
| `ctx.loader.create(options)` | 创建 entry，返回 id |
| `ctx.loader.remove(id)` | 删除 entry（级联） |
| `ctx.loader.update(id, options)` | 更新 entry |
| `ctx.loader.resolve(id)` | 查 entry（支持 `父:子`） |
| `ctx.loader.entries()` | 遍历所有 entry |
| `ctx.loader.import(name)` | 导入模块（支持 `cordis:` builtin） |
| `ctx.loader.importModule(name)` | 导入 + 登记动态依赖（HMR 追踪） |
| `ctx.loader.await()` | 等待所有加载完成 |
| `ctx.loader.builtins` | 内建插件表（group/include） |

## 不稳定 API（内部实现，可能变）

- `ctx.reflect` / `ctx.registry` / `ctx.events`（内部服务）
- `symbols.*`（内部符号）
- `internal/*` 事件
- `Entry` / `EntryTree` 的私有字段

## 与 DSH 的一致性

- 签名、语义与 `deepseek-harness/vendor` 一致
- 12 处差异已登记（watch 修复 / 类型适配 / 事件修正）
- 新增：`ctx.loader.importModule()`（动态依赖登记）

## 版本策略

**无版本门槛**（P7）：内核不检查插件版本，有 `apply` 就能接。
