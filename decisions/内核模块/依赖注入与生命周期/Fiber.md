# Fiber

**父级**：[依赖注入与生命周期](../README.md)

## 负责什么

状态机、effect、dispose、runtime：一个插件实例的生命周期单元。

## 相关源码

`packages/cordis/src/fiber.ts`

## 讨论链

1. 起点：一个插件可以被 `ctx.plugin()` 多次挂载，每次挂载是一个独立实例。
2. 关键判断：实例的生命周期不能靠手动管理——要由依赖状态自动驱动。
3. 收敛：Fiber 用依赖 epoch 驱动状态机；effect 注册清理函数，unload 时按 LIFO 执行。

## 决定

1. **状态机**：`PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED`；`FAILED` 表示启动/运行错误。
2. **依赖 epoch**：`_refresh` 计算 inject 服务的 `fiber.uid` 序列；epoch 变化触发 reload / unload。
3. **effect**：注册清理函数，支持同步/异步/generator；dispose 时**逆序（LIFO）**执行；异步初始化用 setup barrier 处理竞态。
4. **dispose**：清空 `_disposables`，await 所有清理；期间禁止新 effect（`INACTIVE_EFFECT`）。
5. **config 校验**：`resolveConfig` 用 standard schema 校验；失败抛 `ValidationError`。
6. **runtime**：同一 plugin callback 的所有 fiber 共享一个 `Plugin.Runtime`。
7. **await**：等待 `inertia` 结算；启动错误会被重抛。
8. **根 fiber**：uid=0，runtime=null，是 Context 构造时创建的。

## 验收

| # | 判据 | 来源 |
|---|---|---|
| 1 | 插件卸载时 effect 清理函数自动执行，且按 LIFO | 历史决策「测试策略」 |
| 2 | provider 卸载后，inject 它的 consumer 自动停用 | 历史决策「测试策略」 |
| 3 | 异步 effect 的清理会被 await | 源码语义 |
| 4 | config 校验失败时 fiber 进入 FAILED，`await` 重抛错误 | 源码语义 |
| 5 | 同一插件多次挂载产生多个独立 fiber | 源码语义 |

## 与核心战略的关系

- P1：生命周期是内核机制
- P3：任意深度的子插件都有独立的 fiber 和 effect
- P7：config 校验只看 schema，不看版本号
