# 热更新

**父级**：[内核模块](../README.md)

## 负责什么

HMR：文件变更怎么检测、依赖图怎么分析、模块怎么替换、状态怎么保留。

## 相关源码

`packages/cordis-plugin-hmr/src/`

## 决策

1. **监听**：chokidar `watch(root)`，`ignoreInitial: true`，`ignored` 匹配相对路径。
2. **依赖图**：从 ESM `ModuleJob.linked` 递归收集依赖，跳过 `node:` 和 `node_modules`。
3. **三集合**：
   - `stashed`：变更文件
   - `accepted`：需要重载的模块（变更文件 + 依赖它的模块）
   - `declined`：不重载（externals + 没有 accepted 依赖者的模块）
4. **externals**：入口（`bin/dx.ts`）的静态依赖树；变更 → `loader.exit()` 全量重启。
5. **partialReload**：
   - 清 ESM `loadCache` + CJS `require.cache`
   - 重新 `loader.import` 插件入口
   - `registry.delete(plugin)` + 用新 plugin 重建 fiber
6. **原子重载单元**：插件入口文件；深层依赖变更会回溯到入口。
7. **状态**：fiber 重建；Service 实例状态不自动保留（模块级 HMR 的固有限制）。
8. **配置对齐**：`base` 必须与 `root` 的 cwd 基准一致，否则 `resolve()` 拼错路径、`loadCache` 不命中。
9. **不做版本检查**（P7）。
10. **依赖 timer**：`inject: ['timer']`，用 `ctx.debounce` 做防抖；没有 timer 会永远 PENDING（静默）。
11. **日志走 logger**：`ctx.logger.info/warn`，需要 console exporter 才能看到。
12. **配置文件变更**：`entries.yml` 本身修改会触发 loader 的 entry 更新（按 id 比较）；无 id 的条目每次读取生成新 id，会被视为删除 + 添加。
13. **PENDING 诊断**：`ctx.registry.values()` 遍历 fiber，检查 `FiberState.PENDING`。

## 与 DSH 成熟代码的差异

`diff -u` 结果：5 处有意修改（都为了修 watch 收不到 change 的问题）：

1. `root` / `ignored` 加默认值（`?? ['.']` / `?? []`）
2. 去掉 `...this.config`（会把 `root`/`ignored`/`base`/`debounce` 灌进 chokidar options）
3. 去掉 `cwd: watchBaseDir`（路径基准混乱）
4. `ignored: path => match(path)`（chokidar 给的是相对 cwd 的路径，不能再 `relative`）
5. `debounce ?? 100`

另外加了两行 stderr 诊断日志（`[hmr] change` / `[hmr] reloaded`），方便没有 console exporter 时观察。

这些修改都登记为**决策 8**（base 对齐）的配套修复。

## 验收

| # | 判据 |
|---|---|
| 1 | 改插件入口 → 对应插件 reload |
| 2 | 改深层依赖 → 重载依赖它的所有插件入口 |
| 3 | 改嵌套 group 内插件 → 对应插件 reload |
| 4 | 改 externals → 全量重启 |
| 5 | reload 后进程不退出、会话不断 |
| 6 | `base` 与 `root` 基准一致（回归：base=../..） |

## 兼容性边界（哪些插件能自进化）

| 类别 | 情况 |
|---|---|
| **能热更** | ESM 插件（入口通过 `entry.options.name` 声明）；静态 import 的深层依赖；嵌套 group 内插件；任意 `packages/**` 下的文件 |
| **部分能热更** | CJS 插件（清 `require.cache`，但循环依赖/单例状态可能残留）；动态 `import()` 的子模块（不在静态 `linked` 图里）；有运行时状态的插件（fiber 重建，流/连接/计时器丢失） |
| **不能热更** | externals（`bin/dx.ts` 的静态依赖 → 全量重启）；native 模块（node-pty / koffi / sixel，进程级不能替换）；配置文件（需 include refresh 或重启） |

## 插件规范（保证“所有插件都能自进化”）

为了让自进化不留死角，插件必须满足：

1. **ESM**：入口是 ESM 模块
2. **静态 import**：内部依赖用静态 import，不用动态 `import()`
3. **effect 清理**：所有副作用（定时器、连接、子进程、监听器）通过 `ctx.effect` 注册清理
4. **状态外置**：需要跨 reload 保留的状态放 storage / session，不放模块级变量
5. **入口声明**：通过 `entry.options.name` 挂载，不手工 `ctx.plugin` 一个匿名函数

违反这些的插件，HMR 不保证能热更——它们会被标记为“不可自进化”的设计前提，而不是假装能热更。

## 规范插件下的覆盖范围

当插件满足规范（ESM / 静态 import / effect 清理 / 状态外置 / 入口声明）时：

| 插件形态 | 能否热更 | 说明 |
|---|---|---|
| ESM 入口 + 静态依赖 | ✅ | 入口、深层依赖、嵌套 group 都能回溯 |
| 有状态（状态外置到 storage） | ✅ | reload 后从 storage 恢复 |
| 有副作用（effect 清理） | ✅ | reload 时清理干净，无泄漏 |
| 嵌套 group 内插件 | ✅ | `entries()` 递归 |
| 任意 `packages/**` 下文件 | ✅ | `root: [packages]` |

这已经覆盖绝大多数业务插件。

## 扩展路线（让更大范围的插件能热更）

规范后仍不能热更的形态，以及对应的扩展方案：

| 形态 | 原因 | 扩展方案 | 实现位置 |
|---|---|---|---|
| externals（框架入口静态依赖） | 改引导代码 = 重启 | **缩小 externals**：`bin/dx.ts` 只留引导，业务逻辑全走 loader | 插件装配（插件模块） |
| native 模块（node-pty / koffi / sixel） | 进程级 ABI，不能替换 | **进程隔离**：native 能力做成独立进程/worker 插件，HMR = 重启进程 | 插件分类/规范（插件模块）+ 内核进程管理 |
| 配置文件（entries.yml） | 不走模块图 | **include 管理**：`cordis-plugin-include` 的 `refresh()` | 内核（插件加载） |
| 动态 `import()` | 不在静态 `linked` 图 | **`ctx.import()` 包装**：记录到依赖图 | 内核（热更新/插件加载） |
| 有状态但没外置 | reload 丢失 | **状态迁移协议**：插件导出 `serialize/restore`，HMR 自动迁移 | 协议在插件规范，调用在内核 HMR |
| worker / 子进程插件 | HMR 不管理子进程 | **worker 重启**：生命周期绑定 worker，重启 worker 而非主进程 | 插件分类 + 内核生命周期 |

**分工原则**：**内核提供机制，插件规范规定用法。** 内核不知道具体插件形态（P1）——所以：

- 内核负责：依赖图收集、状态迁移的调用点、worker 生命周期、配置 refresh
- 插件模块负责：native/worker 插件的实现标准、`serialize/restore` 接口、`ctx.import()` 使用规范、externals 缩小

**终极目标**：所有插件都能热更——native 走进程替换、配置走 include、动态 import 走包装 API、状态走迁移协议。

## 已知限制

- 动态 `import()` 的子模块不在静态 `linked` 图里，变更可能追踪不到
- Service 内部运行时状态（进行中的流等）在 reload 时丢失
