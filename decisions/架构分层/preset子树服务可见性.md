# preset 子树服务可见性（核心架构修复）

**父战略**：[架构分层](../README.md)

## 讨论链

1. 现象：`tool-bash`/`terminal-bash`/`tool-web`/`tool-workflow` 报 `waiting for shell/sandboxPolicy/web/workflowEngine`，但这些服务宿主层都有。
2. 根因：`agent-preset-registry` 的 `owner = ctx`（`Include` entry ctx），`createScope(owner)` 创建的 preset scope 与宿主 entry 是**兄弟关系**，不继承宿主 entry 的服务。
3. 修复：`owner = ctx.root`——preset scope 继承 root 的 isolate，能看到所有宿主服务。

## 与 DSH 的等价性

DSH 的 `agent-preset-registry` 在 root 层，它的 `ctx` 本身就是 root；我们的在 `Include` entry 层，改成 `ctx.root` 等价于 DSH。

## 影响

这是"无限嵌套"能成立的关键：scope 必须继承 root，否则子树的插件看不到宿主服务。
