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

已查 DSH 源码：没有独立的"审核/回滚"插件；相关能力是：
- `session-checkpoint-policy`：崩溃恢复检查点（语义检查点，不是用户回滚）
- `session-persistence-jsonl` 的 `rollbackAppend`：追加失败的原子回滚（不是历史回滚）

结论：维叶莎的 audit 自建（`audit.jsonl` + `backups/`），参考 DSH 的 checkpoint 思路；不依赖 DSH 插件。

## 边界

- 不替代用户审核
- 不静默改历史
- 记录可查、可回滚

## 验证

- 写入后生成备份 + 审计记录
- 能按记录回滚

## 现有代码

`src/skills/audit.py`。
