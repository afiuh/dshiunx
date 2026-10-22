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
8.1 **动态 import 登记**：`ctx.loader.importModule(specifier)` 把模块 URL 记入 `dynamicDeps`，HMR 的 `loadDependencies` 合并追踪。
8.2 **状态迁移**：reload 时旧 plugin 的 `serialize()` → 新 plugin 的 `restore(state)`；失败只 warn，不阻断重载。
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
| native 模块（node-pty / koffi / sixel） | `.node` 加载后不能卸载 | **服务封装 + 三层边界**：插件 JS 热更 / 句柄 serialize-restore 传递 / `.node` 升级重启 worker | 插件规范（服务封装）+ 内核 HMR |
| 配置文件（entries.yml） | 不走模块图 | **include 管理**：`cordis-plugin-include` 的 `refresh()` | 内核（插件加载） |
| 动态 `import()` | 不在静态 `linked` 图 | **`ctx.loader.importModule()`**：已实现，记录到 `dynamicDeps`，HMR 合并追踪 | ✅ 内核（插件加载 + 热更新） |
| 有状态但没外置 | reload 丢失 | **状态迁移协议**：插件导出 `serialize/restore`，HMR 自动迁移 | ✅ 已实现（旧 plugin serialize → 新 plugin restore） |
| worker / 子进程插件 | HMR 不管理子进程 | **单 cordis + 远程 fiber**：worker 只跑代码，ctx 是 RPC 代理，不重启 worker | 内核（远程 fiber）+ 插件规范 |

**分工原则**：**内核提供机制，插件规范规定用法。** 内核不知道具体插件形态（P1）——所以：

- 内核负责：依赖图收集、状态迁移的调用点、worker 生命周期、配置 refresh
- 插件模块负责：native/worker 插件的实现标准、`serialize/restore` 接口、`ctx.import()` 使用规范、externals 缩小

**终极目标**：所有插件都能热更——native 走服务封装、配置走 include、动态 import 走包装 API、状态走迁移协议。

## worker 与 native 的架构方案

### worker 热更：单 cordis + 远程 fiber（不重启 worker）

**不采用**“多个 cordis 主从互联”——那会把单进程框架硬拆成分布式，registry/loader/HMR 都要维护两套，成本翻倍。

**采用**：

```
主进程：唯一 cordis
├── 普通插件（本地 fiber）
└── worker 插件（远程 fiber）
    └── worker：只跑插件代码，没有 cordis
```

- 插件在主进程有 fiber；`ctx` 是 RPC 代理（`get` / `provide` / `emit` / `effect` / `dispose`）
- 生命周期、服务、事件全在主进程
- HMR 只有一套：主进程检测变更 → 通知 worker 重新 `import` → 主进程重建 fiber
- worker 只负责“执行代码 + 持有 native 句柄”

### 为什么 DSH 没有 worker 插件机制（对照结论）

查证 DSH 源码/文档：

| 事实 | 出处 |
|---|---|
| 插件是 **in-process 挂载** | `docs/architecture.md`："direct in-process plugin mounting" |
| 隔离靠 **sandbox**，不隔离插件本身 | `docs/architecture.md`：限制子进程用 `ctx.sandbox`；`capability-seams` 有 sandbox-ssh / windows-acl 等后端 |
| subagent 也是 **in-process** | `subagent-spawn-in-process`：共享 agent factory / LLM / tool 服务 |
| worker_threads 只用于**非插件**场景 | typert generator、文档预览（excel/pdf）、file-upload |

**修正：DSH 的第三方插件也不是“可信”的**。`plugin-manager` README 明确写着：

> installed Host code executes **in-process outside the workspace sandbox**

也就是说：DSH 的插件市场有第三方/AI 写的插件，它们**在进程内运行、没有沙箱隔离**。DSH 的安全模型是“**安装时审批**”（`danger-full-access` 或 approval），安装后信任。

**DSH 不做 worker 的真实原因**：
1. **安装有人工把关**：用户点安装/审批，有“人类判断”环节
2. **简单性**：cordis 的服务/生命周期是单进程语义
3. **隔离需求用 sandbox 解决**：限制子进程权限，不隔离插件本身
4. **性能**：实测 in-process 0.023µs/call vs worker RPC 7.3µs/call（**314x**）

**dshiunx 需要 worker 的真实原因**：
1. **AI 自动生成插件，没有人工安装审批**——这是与 DSH 的根本差异
2. **native 插件**：koffi / pty 可能崩溃
3. **不重启热更**：worker 内重载，主进程不受影响

**结论（修正）**：不是“DSH 信任插件”，而是“DSH 用安装审批替代运行时隔离”。dshiunx 的 AI 自动写插件没有审批环节，所以需要运行时隔离来补上这个安全缺口。

**性能结论**：worker RPC 单次 7.3µs，对**工具级调用**（毫秒级）可忽略；对**高频事件**（每 token 触发）会累加。所以应分级隔离，而不是全量 worker：

| 插件类型 | 隔离方式 | 理由 |
|---|---|---|
| 可信插件（官方/用户手写） | in-process | 无 RPC 开销 |
| AI 生成 / 第三方 | worker | 隔离优先，工具级调用可接受 7µs |
| 高频事件插件 | in-process（仅可信） | RPC 开销不可接受 |

### worker 内 HMR：已验证可行（2026-10-22）

原型验证（worker_threads + `--expose-internals`）：

```
main: {"type":"load","value":"v1","cached":true}
main: {"type":"reload","value":"v2","cached":false}
```

- worker 内可通过 `internal/modules/esm/loader` 拿到 `loadCache`
- `Map.prototype.delete.call(loadCache, url)` + 重新 `import(url + '?v=...')` → 拿到新版本
- 主进程 `postMessage({ type: 'reload', url })` → worker 内重载 → 返回新值
- **worker 不重启**（同一个 worker 实例）

**前提**：`--expose-internals`（或 `node-addon-require-builtin`）；每个 worker 有自己的 loader 实例。

**结论**：路径 A（单 cordis + 远程 fiber）成立；worker 内只需实现“清缓存 + 重新 import”，不需要完整的 cordis。

### native 模块：服务封装 + 三层变更边界

```
插件 JS（经常变）→ 服务接口（稳定）→ native 实现（极少变）
```

| 层 | 变更频率 | 热更方式 |
|---|---|---|
| 插件 JS 代码 | 高 | ✅ 热更 |
| native 句柄（pty/连接） | 不重启 | ✅ `serialize/restore` 引用传递 |
| `.node` 文件 | 极低 | ⚠️ 重启 worker（主进程/会话不断） |

**前提**：
1. 插件不得直接 `import` native 模块，必须依赖服务接口
2. native 实现隔离在服务里，可独立升级/替换
3. 有状态插件支持 `serialize/restore`

**结论**：日常改代码不重启；只有升级 `.node` 文件才重启 worker——这是合理边界，不是妥协。

## 排错案例：改深层依赖，HMR 不重载（2026-10-22）

### 现象

测试「HMR：改深层依赖重载入口」：改 `dep.ts`，`hmr/reload` 不触发，8 秒超时。

### 排查过程（按顺序，每步缩小范围）

1. **加 `[hmr] change` 日志** → change 触发了，说明 chokidar 监听正常
2. **加 `inCache` 日志** → `inCache=false`，说明 `dep.ts` 不在 ESM `loadCache`
3. **检查两个缓存**：
   - `loadCache`：只有 `entry.ts`
   - `require.cache`：`entry.ts` + `dep.ts`
   - 结论：`dep.ts` 被当成 CJS 加载
4. **对比实验**：临时目录加 `package.json`（`{"type":"module"}`）→ `dep.ts` 进入 `loadCache`，`require.cache` 为空 → HMR reload 成功

### 根因

测试的临时目录（`mkdtempSync`）**没有 `package.json`**。tsx 看到没有 `"type": "module"`，按 CJS 处理 `.ts` 依赖，走 `require.cache`；HMR 的 change 回调只检查 ESM `loadCache`，所以跳过。

### 修复

测试临时目录加 `package.json`（`{"type": "module"}`）。真实项目根 `package.json` 已有 `"type": "module"`，不受影响。

### 教训（未来参考）

- **“改了不生效”先确认文件在哪个缓存**：ESM `loadCache` vs CJS `require.cache`
- **模块格式由 `package.json` 的 `type` 决定**，不是文件扩展名
- **HMR 的追踪只覆盖 ESM**；CJS 依赖需要额外处理（`require.cache` 检查 + CJS 依赖图）
- 排查顺序：change 是否触发 → 在不在 loadCache → 在哪个缓存 → 对比实验

## 已知限制

- **深层依赖的模块格式取决于 `package.json`**：目录没有 `"type": "module"` 时，tsx 把 `.ts` 依赖转成 CJS（走 `require.cache`），不在 ESM `loadCache` 里，HMR 追踪不到。真实项目有 `"type": "module"`，依赖走 ESM，HMR 正常（2026-10-22 实测：加 `package.json` 后 `dep.ts` 进入 `loadCache`，深层依赖 reload 成功）
- 动态 `import()` 的子模块不在静态 `linked` 图里，变更可能追踪不到
- Service 内部运行时状态（进行中的流等）在 reload 时丢失
