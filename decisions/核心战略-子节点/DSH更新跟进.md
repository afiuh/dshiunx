# DSH 更新跟进

**父级**：[计划与经验](./计划与经验.md)

## 要做什么

跟进 DSH `0.2.1-rc.2 → 0.2.2-rc.1` 中**内核/协议级**的修复，跳过产品功能（cua/forge/schedule/desktop/Web UI）。

## 为什么要做

dshiunx 的 90 个包是**复刻**不是依赖——上游修的内核问题，不跟进就会在自己的代码里重演：

- 插件树跨树移动丢节点
- entries.yml 生成的 id 带冒号会挂
- 旧会话（v0 格式）读不了

> 用户（2026-11-07）：
> "除了不需要跟进的那些东西，我也认为都需要更新。"

## 怎么做

### 版本事实（归档 39 阶段）

| 项 | 值 |
|---|---|
| 本地 dshiunx | `0.2.1-rc.2` |
| DSH 最新 | `0.2.2-rc.1`（commit `66491b05`） |
| 中间隔了 | `0.2.1-rc.3` / `rc.4` / `rc.5` / `0.2.2-alpha.2` / `alpha.3` |
| 变更规模 | 250 提交 / 300 文件；17 feat / 78 fix |

### 必须跟进（内核 / 协议，5 条）

| 提交 | 为什么 |
|---|---|
| `fix(cordis): backport cross-tree group member transfer from cordis#271` | 插件树跨树移动——dshiunx 的无限嵌套直接依赖 |
| `fix(cordis): transfer cross-tree moves and contain Include refresh rejections` | 同上，Include 刷新拒绝要兜住 |
| `fix(cordis): accept colon-containing entry ids used by generated bundles` | entries.yml 生成的 id 带冒号会挂 |
| `fix(session): migrate format v0 logs with subagent descriptor v1 and v2` | 会话格式迁移——session 存储要跟上 |
| `fix(session): require label in format v0 descriptor v1` | 同上 |

**不跟进会出现**：插件树移动丢节点、旧会话读不了。

### 建议跟进（性能 / 工具 / 模型，6 条）

| 提交 | 价值 |
|---|---|
| `perf(client-modules): index Loader entries once per flush` | 加载器每次 flush 重建索引；dshiunx 包多，值得 |
| `perf(session): send one projection frame per committed event` | 投影从多帧变一帧，长会话明显 |
| `feat(llm): allow plugins to prepare pi-ai request headers` | 插件能改请求头，模型适配层直接用 |
| `fix(llm-pi-ai): offload old images when a request exceeds the image-count bound` | 图片超限自动 offload |
| `feat(tool-fs): add applyPatchGuard` | `apply_patch` 可绕过 observation guards |
| `feat(fs): ship apply_patch on and the observation policy off` | 默认开 `apply_patch`，observation policy 默认关 |

### 不需要跟进（DSH 的产品功能）

| 领域 | 提交 |
|---|---|
| cua（computer-use） | 权限引导、helper 产物、路径穿越 |
| forge（评审 / worktree） | 会话状态、评审位置 |
| schedule（日程） | 独立任务、统一创建 |
| desktop | 桌面打包、资源判别 |
| Web UI | 侧栏文件树、右键菜单、context-menu |

### 0.2.2 的 upgrade-guide 细节（代码验证）

`docs/upgrade-guide/v0.2.2-alpha.2/` 有 12 个主题，与 dshiunx 相关的是：

| 主题 | 变更 | 对 dshiunx 的影响 |
|---|---|---|
| `cordis-loader-entry-trees` | `EntryTree.write()` 移除，改 `commit(change)`；Include 用 journal 持久化 | loader 子类要改（dshiunx 的 loader 继承 EntryTree） |
| `fs-observation-policy-default-off` | `fs-observation-policy` 默认 `disabled: true`；`tool-fs` 新增 `applyPatch: true` | dshiunx 装了 observation policy（entries.yml 有），要决定是否跟随默认关闭 |
| `projection-event-frames` | 每帧携带一个事件改变的全部 key（`changes` 数组） | dshiunx 没有 Remote 客户端，影响小 |
| `llm-request-purpose-declarations` | `GenerateOptions.purpose` 由 `LlmRequestPurposeMap` 派生 | compaction-basic / session-title 要加载生产方声明 |
| `pi-ai-request-image-count` | 图片超 50 张省略最老的 | 与建议跟进的图片 offload 对应 |
| `projection-released-checkpoint` | `checkpoint(session)` 保留已释放单元最后一行 | 检查点策略可能受影响 |
| `projection-snapshot-scope` | snapshot 只计算返回的单元；列表摘要不再含 context pressure/breakdown | token-meter 的 breakdown-projection 可能受影响 |

## 边界

- **不跟产品功能**：cua、forge、schedule、desktop、Web UI 一律不跟
- **不整体升级**：dshiunx 是复刻不是依赖，升级 = 逐包同步源码
- **不丢本地修改**：dshiunx 对复刻包有本地修改（去产品包袱、改装配），同步时保留

## 如何验证自己做对了

- 跨树移动一个 group，节点不丢
- entries.yml 里带冒号的 id 能加载
- v0 格式的旧会话能被迁移器读出来
- `grep -n "commit(change)\|EntryTree.write" packages/cordis-plugin-loader/src/config/tree.ts` 能看到用的是哪种
- 人看：这页的"必须跟进"5 条，每条都能在 DSH 的 commit 里找到
