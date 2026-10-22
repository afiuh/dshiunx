# 插件规范

**父级**：[插件模块](../README.md)

## 负责什么

一个插件必须是什么样：manifest、生命周期契约、服务契约、配置 schema、隔离边界。

## 设计原则

**插件规范不是独立设计的，它是内核契约的“使用说明”。** 每一条规则都必须能追溯到内核模块的某个决策；不是拍脑袋定的。

## 规范条目 → 内核依据（设计输入）

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

## 待研究

- manifest 的具体字段（不含版本号，P7）
- 生命周期契约的完整定义（apply / dispose / update）
- 服务契约（Service 基类 vs 函数插件）
- 隔离边界（isolate 的推荐用法）
- 自进化检查（哪些插件满足 HMR 规范）
