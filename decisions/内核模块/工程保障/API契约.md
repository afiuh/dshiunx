# 内核 API 契约

**父级**：[工程保障](../工程保障.md)

## 为什么需要

公共 API 要稳定（契约文档 + 变更记录）

## 准备怎么实现

### 细节实现

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
| `fiber.rawConfig` | 原始输入：getter 读、setter 只保留（不触发更新） |
| `fiber.effectiveConfig` | 已发布配置（不克隆）；首次解析前 undefined，卸载后仍可读 |
| `fiber.resolveConfig(candidate)` | 评估候选配置（hooks + schema），不发布、不替换、不提交 volatile |
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

### Tools（工具服务）

| API | 语义 |
|---|---|
| `ctx.tools.register(def, options?)` | 注册工具定义（schema + execute），返回 disposer |
| `ctx.tools.setExecutor(executor)` | 注册执行器，返回 disposer；**每个 scope 只能一个** |
| `ctx.tools.execute(batch)` | 执行一批调用，委托给当前 scope 的执行器 |
| `ctx.tools.definitions(scope?)` | 当前 scope 可见的工具定义 |
| `ctx.tools.schemas(scope?)` | 工具 schema（模型可见形态） |
| `ctx.tools.resolve(context)` | 解析 step 的工具集合（admission） |
| `ctx.tools.restrict(filter)` | 限制可见工具，返回 disposer |
| `ctx.tools.guard(guard)` | 注册执行前守卫，返回 disposer |

**契约**：

1. **定义与执行分离**：`ctx.tools` 只管定义、可见性、分发；执行由 `ToolExecutor` 插件承担
2. **无执行器 = 明确失败**：没有执行器时列定义仍可用，但 `execute` 抛 `ToolExecutorUnavailableError`（不静默降级）
3. **执行器按 scope 唯一**：同一 scope 注册第二个执行器直接抛错（避免策略歧义）
4. **执行器卸载**：保留"不可用选择"（记录在、`executor = undefined`），后续调用抛 `ToolExecutorUnavailableError`，不会落到另一个执行器
5. **dispatch 时选择**：`execute` 按 `agent` 的 scope 链选最近执行器；已接受的批次即使执行器随后卸载也执行完
6. **sections 随执行器挂载**：`setExecutor` 注册时把 `executor.sections` 挂到系统提示，只在该执行器被选中时渲染
7. **批级接口**：`ToolBatchInput` / `ToolBatchResult`——执行器拿整批调用，而不是单个

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

## 参考什么

（源码/归档）
