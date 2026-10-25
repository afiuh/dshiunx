# jarvis-tasks

**父模块**：`../node.md`

## 接口

- `ctx.jarvisTasks.add(text): Promise<string>` —— 捕获一条事务到 inbox

## 依赖

- 无（`fs`）
- 事务系统路径：`具体安排工作区/jarvis-inbox.md`

## 边界

- 只捕获，不自动归档
- 格式：`- [ ] <事务>（捕获 <时间>）`
- 不静默改正式事务表

## 验证

- "记事务：明天下午三点买牛奶" → 写入成功
- 不重复写入

## 现有代码

`src/skills/tasks.py`。
