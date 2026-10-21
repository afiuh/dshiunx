# dsh-tui 设计

## 定位

Cordis 插件（不是独立 app），`inject` 多个服务，直接整合多插件信息。

## 不打扰原则（参考 pi）

| 规则 | 做法 |
|---|---|
| 不弹审批 | `approval: never`，工具直接执行 |
| 不自动弹窗 | 不用系统通知、不弹模态 |
| 不打断流式 | 输出中不插入状态行 |
| 状态栏不刷屏 | 只在 turn 结束更新 |
| 工具折叠 | 默认一行摘要，`Ctrl+O` 展开 |
| 错误一行 | `✗ message`，不刷栈 |

## 对话回滚/修改（参考 dsh-TUI）

基础：`session/event` 是 append-only log。

| 操作 | 实现 |
|---|---|
| 回滚到某轮 | 截断 `session` 到该轮的 `seq`，重建 agent |
| 修改历史消息 | 替换该 `seq` 的 user message，截断之后的事件，重放 |
| double-Esc | 进入 rewind 模式，方向键选轮次，Enter 确认 |

## 结构

```
src/
  index.ts        # 插件入口：inject + 订阅
  view-event.ts   # 呈现协议
  projection.ts   # session/event → ViewEvent
  renderer.ts     # ANSI 渲染
  input.ts        # readline + 快捷键（待写）
  rewind.ts       # 回滚/修改（待写）
  status.ts       # 状态栏（待写）
```

## 开发规则

- 每完成一个小功能就 commit
- renderer 不读 DSH 内部状态，只消费 ViewEvent
- 回滚/修改通过 session API，不直接改 JSONL
