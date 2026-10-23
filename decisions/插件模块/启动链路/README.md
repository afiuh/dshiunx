# 启动链路

**父级**：[插件模块](../README.md)

## 负责什么

从宿主入口到插件树加载完成的整条链路：Context 创建 → Loader 安装 → profile patches → entries.yml 挂载 → 启动审计。

## 相关源码

`packages/dsh-app-boot/src/index.ts`（`boot` / `mountRootInclude` / `auditStartupEntries`）

## 检查结论

**与 DSH 的 `packages/boot/app-boot` 完全一致**（23 个文件，`diff -rq` 无差异）。无行为修改。

## 决策

1. **boot 五步**：
   - 创建 Context + diagnostics（启动日志收集）
   - 设置 `baseUrl`（配置目录）、提供 `dshHomePath`
   - `ctx.plugin(Loader)`
   - `prepare(ctx)`（宿主准备，失败 = host preparation failed）
   - `mountRootInclude(...)`（挂载 entries.yml）
   - `ctx.loader.await()` → `auditStartupEntries(...)`

2. **builtins 注册**：`cordis:include` + `cordis:group` 在 include 挂载前注册；`HostResolvedRootInclude` 用 `internal.import` 解析裸包名（`bareModuleBaseUrl`）。

3. **固定 id**：bootstrap include 的 id 固定为 `include`（启动诊断稳定，不随随机 id 变化）。

4. **必需项 vs 非必需项**：
   - `requiredStartupEntryIds` + bootstrap include = 必需项
   - 必需项失败 → 抛 `StartupError`（阻断启动）
   - 非必需项失败/缺失/pending → 只 `warn`，不阻断（成功兄弟继续运行）

5. **启动审计**：`inactiveEntries` 收集失败/缺失/pending 的 entry；`auditStartupEntries` 按必需性分级处理。

6. **错误包装**：`StartupError` 带配置路径 + 启动日志（warn/error）；其他错误按 `host preparation failed` / `plugin tree failed to load` 两阶段标注。

7. **`internal/update` 钩子**：捕获 `Fiber.update()` 丢弃的 restart promise，避免未处理 rejection。

## 与 DSH 的差异（preset scope 的 loader 访问）

| | DSH | 我们 |
|---|---|---|
| `agent-preset-registry` 的 owner | `ctx`（entry ctx） | **`ctx.root`**（D39 修复，解决 D40 服务可见性） |
| `EntryTree` 访问 loader | `this.ctx.loader`（属性访问，entry ctx 有 loader inject） | **`this.ctx.get('loader')!`**（反射 API，不依赖 inject） |
| 结果 | preset scope 看不到 root 服务（D40 问题） | 能看到 root 服务；`ctx.get` 绕开 inject 要求 |

**为什么改**：`owner = ctx.root` 后，scope 继承 root，root 的 fiber 不提供 loader，`ctx.loader` 属性访问被拒绝（`cannot get property "loader" without inject`）。改用 `ctx.get('loader')!` 后，反射 API 不受 inject 限制。

**代价**：与 DSH 的 loader 有 4 处差异（`group.create` / `tree.import` ×2 / `isolate`），已登记。

## 启动日志修复

`logger-console` 原本在 `boot()` 之后挂载，导致 boot 期间的 logger 日志（HMR watching、preset 错误）丢失。改为在 `prepare` 回调里挂载（entries 挂载前），日志完整。

**这个修复暴露了 preset 的 loader 访问错误**——之前被静默吞掉。

## 验收

| # | 判据 |
|---|---|
| 1 | 启动失败时 `StartupError` 带配置路径 + 启动日志 |
| 2 | 非必需项失败不阻断启动（warn） |
| 3 | 必需项失败阻断启动 |
| 4 | bootstrap include 的 id 固定为 `include` |
| 5 | 启动后 `ctx.loader.await()` 等待所有 entry 结算 |

## 检查项（第一批）

- [x] `boot()` 流程与 DSH 一致
- [x] `mountRootInclude` 的 builtins 注册与固定 id
- [x] `auditStartupEntries` 的必需项分级
- [x] `StartupError` 的错误包装
- [ ] `entries.yml` 的 86 个启用项是否有冗余（待检查）
- [ ] 启动日志（logger-console 挂载后）是否完整（待检查）
