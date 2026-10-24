# Fiber

**父级**：[依赖注入与生命周期](../依赖注入与生命周期.md)

## 为什么需要

状态机、effect、dispose、runtime：一个插件实例的生命周期单元。

## 参考什么

`packages/cordis/src/fiber.ts`

## 准备怎么实现

### 宏观想法

1. 起点：一个插件可以被 `ctx.plugin()` 多次挂载，每次挂载是一个独立实例。
2. 关键判断：实例的生命周期不能靠手动管理——要由依赖状态自动驱动。
3. 收敛：Fiber 用依赖 epoch 驱动状态机；effect 注册清理函数，unload 时按 LIFO 执行。

### 细节实现

1. **状态机**：`PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`；`FAILED` 表示启动/运行错误。注意：`FiberState` 的 enum 定义顺序是 `PENDING, LOADING, ACTIVE, FAILED, DISPOSED, UNLOADING`（定义顺序 ≠ 流转顺序）。
2. **依赖 epoch**：`_refresh` 计算 inject 服务的 `fiber.uid` 序列；epoch 变化触发 reload / unload。
3. **effect**：注册清理函数，支持同步/异步/generator；dispose 时**逆序（LIFO）**执行；异步初始化用 setup barrier 处理竞态。
4. **dispose**：清空 `_disposables`，await 所有清理；期间禁止新 effect（`INACTIVE_EFFECT`）。
5. **config 校验**：`resolveConfig` 用 standard schema 校验；失败抛 `ValidationError`。
5.1 **配置的三层视图**（rc.3 新增，代码待同步）：
   - `rawConfig`：**原始输入**（未求值、未校验）。getter 读 `_config`；setter 只保留输入，**不改运行中的 config、不触发更新**
   - `effectiveConfig`：**已发布配置**（`update()`/激活后的 `config`），不克隆、不重新解析。首次解析前 `undefined`；卸载后仍可读——需要活实例的调用方自己查 `state`
   - `resolveConfig(candidate)`：**候选评估**——用本 fiber 的 `internal/config` hooks + runtime schema 解析并校验，但**不发布结果、不替换原始输入、不提交运行中的 volatile 引用**
   - **为什么分三层**：三种需求不该混——诊断要原始值、插件内部要生效值、热更新/AI 写插件要"先验证再应用"。混成一个 `config` 会让"读"和"改"互相干扰
   - **依据**：rc.3 `vendor/cordis/src/fiber.ts`（`rawConfig` / `effectiveConfig` / `resolveConfig`）
5.2 **`update()` 与 `restart()` 内部改用 `this.ctx.fiber`**（而不是 `this`）：让调用方即使从别的上下文进入，也作用于"当前上下文的 fiber"
6. **runtime**：同一 plugin callback 的所有 fiber 共享一个 `Plugin.Runtime`。
7. **await**：等待 `inertia` 结算；启动错误会被重抛。
8. **根 fiber**：uid=0，runtime=null，是 Context 构造时创建的；初始化时 `ctx = parent`、`state = ACTIVE`、`store = 空对象`（`fiber.ts:321-326`）。
9. **`_disposables`**：`DisposableList` 收集所有 effect 的 disposer；`dispose()` 清空并按 LIFO 执行。
10. **状态变更通知**：`_updateState` 在状态变化时 emit `internal/status`（参数 `this, oldState`）；只在 ACTIVE ↔ 非 ACTIVE 之间广播（`fiber.ts:586`）。

## 验收

| # | 判据 | 来源 |
|---|---|---|
| 1 | 插件卸载时 effect 清理函数自动执行，且按 LIFO | 历史决策「测试策略」 |
| 2 | provider 卸载后，inject 它的 consumer 自动停用 | 历史决策「测试策略」 |
| 3 | 异步 effect 的清理会被 await | 源码语义 |
| 4 | config 校验失败时 fiber 进入 FAILED，`await` 重抛错误 | 源码语义 |
| 5 | 同一插件多次挂载产生多个独立 fiber | 源码语义 |
| 6 | `resolveConfig(candidate)` 不改变 `effectiveConfig`，也不改变 `rawConfig` | rc.3 源码语义 |

## 与核心战略的关系

- P1：生命周期是内核机制
- P3：任意深度的子插件都有独立的 fiber 和 effect
- P7：config 校验只看 schema，不看版本号
