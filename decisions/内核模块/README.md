# 内核模块

**父级**：[核心战略](../核心战略.md)

## 这个模块负责什么

把内核做干净、做小、做稳：只保留不可插件化的机制，让上层的一切都能被插件替换。

## 这一级拆成哪几个子模块

| 子模块 | 负责什么 |
|---|---|
| [依赖注入与生命周期](./依赖注入与生命周期/README.md) | Context / Fiber / Effect / Service / Registry / Reflect：服务怎么注册、查找、随生命周期创建和销毁 |
| [事件系统](./事件系统/README.md) | waterfall / parallel / serial / bail：插件之间怎么通信 |
| [日志](./日志/README.md) | `ctx.logger`：级别、格式化、导出 |
| [时间与调度](./时间与调度/README.md) | `ctx.setTimeout` / `setInterval` / 防抖：生命周期与 HMR 的时间基础 |
| [插件加载](./插件加载/README.md) | loader / include / 配置校验：配置树怎么读、模块怎么 import、插件怎么实例化 |
| [嵌套与隔离](./嵌套与隔离/README.md) | group / isolate / scope / EntryTree：插件怎么套插件、服务怎么隔离、子 scope 怎么继承 root |
| [热更新](./热更新/README.md) | HMR：文件变更怎么检测、依赖图怎么分析、模块怎么替换、状态怎么保留 |

## 处理顺序（按依赖拓扑）

| # | 子模块 | 依赖 | 为什么排在这里 |
|---|---|---|---|
| 1 | 依赖注入与生命周期 | — | 地基；其余 6 个全部建立在其上 |
| 2 | 事件系统 | 1 | 插件通信的基础；加载器、嵌套、HMR 都要用 |
| 3 | 日志 | 1 | 观测基础；加载器、HMR 都要用 |
| 4 | 时间与调度 | 1 | 防抖/超时基础；加载器、HMR 都要用 |
| 5 | 插件加载 | 1–4 | 把配置变成运行中的插件；嵌套的前提 |
| 6 | 嵌套与隔离 | 5 | 在加载之上构建 scope 树 |
| 7 | 热更新 | 5–6 | 在加载/嵌套之上做替换，依赖时间与日志 |

**为什么 2/3/4 排在 5 之前**：它们都只依赖 1，可以并行研究；但加载器会用到事件（`loader/entry-init` 等）、日志（`ctx.logger`）、时间（防抖/超时），所以先把它们定下来，加载器的边界才清楚。

**为什么 5 先于 6**：没有 EntryTree 就没有 group/isolate 的挂载点；嵌套是加载的一种配置形态。

**为什么 7 最后**：HMR 要复用加载的模块图、嵌套的 scope 结构、时间的防抖、日志的诊断，是依赖最深的模块。

## 明确排除（DSH 有，但我们不要）

| DSH 模块 | 为什么排除 |
|---|---|
| `dsh-app-boot/compatibility-preflight` | 版本/兼容性预检，违反 P7 |
| `dsh-app-boot/plugin-compatibility` | 插件兼容性检查，违反 P7 |
| `dsh-app-boot/profile-compatibility` | profile 兼容性检查，违反 P7 |
| `dsh-app-boot/package-meta` / `official-bundles` | 包版本元数据 |
| 任何 `engines` / `peerDependencies` 版本约束 | 版本门槛，违反 P7 |

**注意区分**：`loader/internal.ts` 的 `version: 'v1' | 'v2'` 是 **Node ESM loader 的 API 形状适配**（选择正确的调用方式），不是“版本不对就拒绝运行”——保留。

## 这一级不回答的问题

- 每个子模块内部怎么实现 → 子模块自己的 `README.md`
- 插件有哪些类别、怎么装配 → [插件模块](../插件模块/README.md)

## 硬约束

- 内核不知道任何具体插件的存在
- 删掉任意插件，内核仍能启动
- 内核不得依赖产品假设（账户、遥测、市场、客户端）
- 插件加载**不做版本验证**：有功能就能接（见核心战略 P7）
- 内核准入判据见[核心战略 P1](../核心战略.md)
