# 插件规范

**父级**：[插件模块](../README.md)

## 负责什么

一个插件必须是什么样：manifest、生命周期契约、服务契约、配置 schema、隔离边界、自进化条件。

## 设计原则

**插件规范不是独立设计的，它是内核契约的“使用说明”。** 每一条规则都必须能追溯到内核模块的某个决策；不是拍脑袋定的。

## 规范条目 → 内核依据

| 插件规范 | 依据的内核决策 |
|---|---|
| ESM 入口 | 热更新：只有 ESM 进 `loadCache`，才能被 reload |
| 静态 `import` | 热更新：依赖图靠 `job.linked` 收集 |
| 副作用用 `ctx.effect` 清理 | 依赖注入与生命周期：Fiber.effect LIFO，dispose 时执行 |
| 状态外置（storage/session） | 热更新：fiber 重建会丢模块级状态 |
| 入口通过 `entry.options.name` 声明 | 插件加载：loader 按 name 解析入口 |
| `Config` schema（Standard Schema） | 插件加载：apply 前验证、默认值补齐 |
| `inject` 声明 | 依赖注入：Registry 用 inject 决定何时启动 |
| 用 `ctx.timeout` / `interval` / `debounce` | 时间与调度：绑定 fiber effect，自动清理 |
| 用 `ctx.logger(name)` | 日志：命名 logger、级别过滤 |
| 事件命名（保留 `internal/` 前缀） | 事件系统：`internal/dispatch` 诊断 |
| `isolate` 的 label 用法 | 嵌套与隔离：LocalRealm / GlobalRealm |

## 1. 插件形态

三种形态都合法：

| 形态 | 写法 | 适用 |
|---|---|---|
| 函数插件 | `export function apply(ctx, config)` | 无服务、纯逻辑 |
| 类插件 | `export class Plugin extends Service` | 提供服务的插件 |
| 对象插件 | `export default { name, apply(ctx, config) }` | **推荐**：有 name、可读性好 |

## 2. manifest 字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `name` | ✅ | 插件名，用于日志 / 诊断 |
| `apply` | ✅ | 入口（函数 / 对象形态） |
| `inject` | ❌ | 依赖的服务（数组或 name → config 映射） |
| `provide` | ❌ | 提供的服务名（类插件） |
| `Config` | ❌ | Standard Schema（配置验证） |

**禁止**：`version`、`compatibleWith`、`engines`——P7 无版本门槛。

## 3. 生命周期契约

| 阶段 | 规则 |
|---|---|
| 启动 | `apply(ctx, config)`；所有副作用通过 `ctx.effect` 注册清理 |
| 卸载 | 由 fiber 自动管理；插件不手动 dispose |
| 更新 | config 变化 → fiber 重建（volatile 字段除外） |
| 禁止 | 模块级可变状态（reload 会丢失） |

## 4. 服务契约

| 项 | 规则 |
|---|---|
| 类插件 | `super(ctx, name)` 构造即注册；随 fiber 注销 |
| 函数插件 | `ctx.provide(name, value)` 手动注册 |
| 服务名 | isolate scope 内唯一 |
| 可选能力 | 用符号（`init` / `check` / `invoke` / `config`） |

## 5. 隔离边界

| 写法 | 语义 |
|---|---|
| `isolate: { name: true }` | 本 entry 独有（LocalRealm） |
| `isolate: { name: 'label' }` | 同 label 共享（GlobalRealm） |
| 不写 | 继承父 scope |

## 6. 自进化检查

满足以下条件的插件**可热更**：

1. ESM 入口
2. 静态 `import`（不用动态 `import()`）
3. 副作用用 `ctx.effect` 清理
4. 状态外置（storage / session）
5. 入口通过 `entry.options.name` 声明

不满足的插件标记为“不可自进化”，不假装能热更。

## 待研究

- manifest 的 `hot` 声明（运行时检测 vs 显式声明）
- 插件分类的边界（运行时 / 界面 / 工具 / 用户）
- 插件装配的 profile 格式
- 插件演化的 AI 写插件流程
