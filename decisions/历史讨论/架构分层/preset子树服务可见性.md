# preset 子树服务可见性（历史判断已修正）

**父战略**：[架构分层](../README.md)

## 原判断（2026-10-21）

1. 现象：`tool-bash`/`terminal-bash`/`tool-web`/`tool-workflow` 报 `waiting for shell/sandboxPolicy/web/workflowEngine`，但这些服务宿主层都有。
2. 原根因判断：`agent-preset-registry` 的 `owner = ctx`（`Include` entry ctx），`createScope(owner)` 创建的 preset scope 与宿主 entry 是**兄弟关系**，不继承宿主 entry 的服务。
3. 原修复：`owner = ctx.root`——preset scope 继承 root 的 isolate，能看到所有宿主服务。

## 修正（2026-10-23）

**原根因判断是错的**：

- 服务查找是**全局 store（按 isolate 标签）**，不是 fiber 链——`reflect.ts` 的 `_getImpl` 用 `this.store[key]`，key 来自当前 ctx 的 isolate map
- **兄弟关系不影响服务可见性**；只要 isolate 标签相同，就能看到
- DSH 的 `agent-preset-registry` 也在 Include 里（`bundle/web-app/cordis.patch.yml` 的 `- insert:`），`owner = ctx`，**不是 root**
- DSH 的 `prepare` 只挂载 profileContext/launchEnvironment/PluginPackages/cmdline，没有把 sandboxPolicy 挂到 root

**回滚验证**：

- `owner = ctx` + `ctx.loader`（4 处 `ctx.get('loader')!` 回滚）
- strict 0；`waiting for` / `cannot get property` 均为 0；启动 96 entries；24 测试通过
- **D40 没有复现**

## 结论

- `owner = ctx` 与 DSH 一致；`ctx.root` 补偿不必要
- 真正的机制：**服务查找按 isolate 标签全局查找**，与 scope 的父子关系无关
- 教训：不要凭历史判断直接下结论，要查机制层（`reflect.get` 的查找方式）

## 影响

- “无限嵌套”的关键不是“scope 继承 root”，是 **isolate 标签一致**
- 历史判断（“DSH 在 root 层”）是错的，已修正
