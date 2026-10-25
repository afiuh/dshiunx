# jarvis-dispatch

**父模块**：`../node.md`

## 接口

- `ctx.jarvisDispatch.run(task, sessionId?): Promise<string>` —— 拉起/继续 pi 对话

## 依赖

- dshiunx：`ctx.agent` / `ctx.sessions`（**已定：依赖 dshiunx 自身的智能体，不 spawn `pi`**）
- 活跃项目台账：`工具的使用/活跃项目台账.md`

## 边界

- 不执行长任务
- 不替用户决定分配
- 结果回传，不阻塞主流程

## 验证

- "任务：用一句话回答 1+1" → 拉起并返回结果
- 指定会话 → 继续该会话

## 现有代码

`src/skills/pi_task.py`（`pi -p` / `pi --session`）——仅作行为参考；新实现走 `ctx.agent`。
