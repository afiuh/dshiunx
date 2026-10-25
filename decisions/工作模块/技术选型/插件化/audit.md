# jarvis-audit

**父模块**：`../node.md`

## 接口

- `ctx.jarvisAudit.record(kind, detail): Promise<void>`
- `ctx.jarvisAudit.backup(path): Promise<string | undefined>`

## 依赖

- 无（`fs`）
- 存储：`~/.local/share/jarvis/audit.jsonl` + `backups/`

## 决策（2026-10-25）

写入即记录 + 可回滚，**不另做审核队列**。

**回滚用 git**（用户 2026-10-25 定）：笔记库/事务系统本身是 git 仓库，回滚 = `git revert` / `git checkout`，不另建 backups。
audit 只负责**记录**（谁/何时/什么/结果），回滚路径指向 git。

## 边界

- 不替代用户审核
- 不静默改历史
- 记录可查、可回滚

## 验证

- 写入后生成备份 + 审计记录
- 能按记录回滚

## 现有代码

`src/skills/audit.py`。
