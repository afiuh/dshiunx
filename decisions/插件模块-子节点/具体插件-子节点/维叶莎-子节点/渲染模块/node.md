# 渲染模块

**父模块**：`../../维叶莎.md`

## 为什么存在

用户要能"看见"——对话、结果、任务状态、输入区。**光听不够**，必须能详细判断汇报是否正确；键盘输入必须完整保留。

## 输入 / 输出

- 输入：工作模块的结果、会话/任务状态、语音模块的状态；
- 输出：界面（对话流、状态面板、输入区）。

## 形态（2026-10-25 用户定）

**Web renderer**（浏览器）：

- **前端**：React 19 + 普通 CSS（参考 DSH `ui-chat` 的组件结构；不用 CSS Modules，构建简单）
- **传输**：HTTP + SSE（流式）；输入 POST `/api/input`
- **形态**：单个 `jarvis-web` 插件（不拆 DSH 的 10+ ui 包）
- **启动**：Shell 命令 `web` → 起本地 HTTP 服务 → 打开浏览器
- **共享数据**：dshiunx 的 session/projection（不重复业务）

## 实现策略（2026-10-25 用户定）

**从零做（~1500 行 React），参考 DSH 的组件结构/交互，不复制代码。**

| 项 | 决策 |
|---|---|
| 做法 | 从零写 React 组件（对话流 / 工具卡片 / 状态面板 / 输入区 / SSE） |
| 参考 | DSH `ui-chat` 的组件拆分（`MessageItem` / `UserContent`）、`tool-call-tree` 的数据结构、`use-chat-viewport` 的滚动策略、`connection` 的传输分层 |
| 不参考 | `window.__DSH_BOOT__`、10+ ui 包拆分、产品功能（账户/市场/审批/telemetry） |
| 为什么 | DSH 前端为它的产品设计，数据模型不同；改造成本 ≈ 读懂一个前端框架再拆一半（TUI 的教训） |

## 状态（2026-10-25）

✅ 插件骨架已建并验证：
- `packages/jarvis-web`：`ctx.jarvisWeb.serve / stop / broadcast`
- HTTP：`/`（静态）、`/events`（SSE）、`/api/input`（POST）
- Shell 命令 `web`（`ctx.inject(['dxShell'])` 等 shell 就绪）
- 最小前端 `web/dist/index.html`
- 验证：首页 HTML / SSE `: connected` / POST 回执 全通

✅ React 前端骨架（2026-10-25）：
- `web/src/`：`App` / `ChatLog` / `MessageItem` / `ToolCall`（折叠）/ `StatusBar` / `SessionList` / `InputBar` / `useChat`（SSE + 发送）
- 构建：`esbuild` → `web/dist/app.js`（144KB）+ `app.css`（3KB）
- 验证：**截屏确认渲染**（侧栏 SESSIONS / 状态栏 connected / 空对话区 / 输入框 + 发送按钮）
- 修正：react 19 与 react-dom 18 版本冲突（`ReactCurrentBatchConfig`），统一到 19

✅ agent 已接（2026-10-25）：
- 服务名是 `agents`（不是 `agent`）；`ctx.get('agents').create()` 懒创建 Web 会话
- `/api/input` → `agent.followup()` → `whenIdle` → SSE `assistant`
- `session/event` 的 `tool/call` / `tool/result` → SSE `tool`
- 验证：`say hi` → SSE `assistant: "Hi! 👋 How can I help you today?"`；截屏确认对话渲染

✅ 思考过程 + Markdown（2026-10-25）：
- `reasoning-delta` → SSE `reasoning` → 折叠块「思考过程」
- 助手回复用 `marked` 渲染 Markdown（加粗/列表/引用/代码块）
- 验证：截屏确认加粗、列表、引用渲染

⏳ 待做：会话列表真实数据、Esc 中断、公式（KaTeX）、执行结果/错误展示。

## 边界

- 不承载业务（只读状态 + 转发输入）；
- 键盘输入完整保留（不是只做语音）；
- 解耦：插件只负责 HTTP/SSE/静态资源；前端只负责展示/输入；
- 慢慢加功能，不一次做重。

## 需要渲染的信息清单（2026-10-25）

### 对话展示（主区域）

| 信息 | 来源 | 展示 |
|---|---|---|
| 用户消息 | 语音（主）/ 键盘 | 文本，标注来源 |
| 助手回复 | agent（流式 + 最终） | 流式追加 |
| 工具调用 | agent tool | 可折叠：工具名 / 参数 / 状态（调用中/完成/失败）/ 结果 |
| 推理过程 | agent reasoning | 默认折叠 |
| 执行结果 | notes / tasks / system / dispatch | 结构化摘要 |
| 错误 | 任意层 | 一行，不刷屏 |

### 状态面板（侧栏 / 状态栏）

| 信息 | 来源 | 展示 |
|---|---|---|
| 会话列表 | `ctx.sessions` | 当前/历史，可切换 |
| 任务状态 | dispatch + agent | 运行中 / 等待 / 完成 / 失败 |
| 语音状态 | `jarvis-voice` | 空闲 / 录音 / 处理 / 说话 |
| 系统状态 | agent / 模型 | 模型 / token / 耗时（可选） |
| 写入/回滚点 | git commit | 最近写入 + 回滚点（可选） |

### 输入区（底部）

| 信息 | 来源 | 展示 |
|---|---|---|
| 语音输入 | `jarvis-voice.transcribe` | ASR 结果直接发送（主输入） |
| 键盘输入 | 用户 | 多行 / 历史 / 快捷键（辅助） |
| 中断 | 用户 | Esc 中断当前 turn |

## 验收标准（当…应…）

| # | 当 | 应 |
|---|---|---|
| 1 | 启动 `dx` 并输入 `web` | 浏览器打开 `http://127.0.0.1:8787`，显示界面（不是空白） |
| 2 | 输入文字按 Enter | 消息出现在对话区，`POST /api/input` 被调用 |
| 3 | 点语音按钮说话 | 按钮变红（录音），再点停止 → 识别（蓝）→ ASR 文本**直接发送** |
| 4 | agent 推送 `assistant` 事件 | 对话区流式追加助手回复 |
| 5 | agent 推送 `tool` 事件 | 出现可折叠工具卡片（状态 running/done/error） |
| 6 | 断开 SSE | 状态栏显示 reconnecting，恢复后自动重连 |
| 7 | 按 Esc | 中断当前 turn（待实现） |

## 决策 vs 代码对照（2026-10-25）

| 决策条目 | 代码 | 结论 |
|---|---|---|
| React 18 + CSS Modules | React 19 + 普通 CSS | ⚠️ 决策已改（以代码为准） |
| HTTP + SSE | `/events` SSE + `/api/input` | ✅ |
| 单插件 jarvis-web | `packages/jarvis-web` | ✅ |
| Shell `web` → HTTP → 浏览器 | `serve()` + `xdg-open` | ✅ |
| 共享 session/projection | `/api/input` → `ctx.agents` → agent → SSE | ✅ 已接 |
| 对话 6 类（含推理/执行结果/错误） | 3 类（user/assistant/tool） | ⚠️ 部分 |
| 状态面板 5 类 | 3 类（连接/模型/品牌） | ⚠️ 部分 |
| 语音直接发送 | `onTranscribed → submitText` | ✅ |
| 键盘输入 | textarea + Enter/Shift+Enter | ✅ |
| Esc 中断 | 未实现 | ❌ |

## 子节点

- `对话展示/node.md`（消息流、工具调用、结果）
- `状态面板/node.md`（会话/任务/语音状态）
- `输入区/node.md`（键盘 + 语音，可编辑）
