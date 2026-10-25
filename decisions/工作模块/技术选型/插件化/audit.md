# jarvis-audit

**父模块**：`../node.md`

## 接口

- `ctx.jarvisAudit.record(kind, detail): Promise<void>`
- `ctx.jarvisAudit.backup(path): Promise<string | undefined>`

## 依赖

- 无（`fs`）
- 存储：`~/.local/share/jarvis/audit.jsonl` + `backups/`

## 决策（2026-10-25）

写入即记录 + 可回滚，**不另做审核队列**。DSH 源码里有此功能（备份/回滚/审计），待抽取为插件。

## 边界

- 不替代用户审核
- 不静默改历史
- 记录可查、可回滚

## 验证

- 写入后生成备份 + 审计记录
- 能按记录回滚

## 现有代码

`src/skills/audit.py`。
