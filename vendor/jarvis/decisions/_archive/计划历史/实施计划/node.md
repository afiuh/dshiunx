# 实施计划

**父模块**：`../../../root.md`

> **2026-10-25 变更**：手机 APP 阶段废弃，项目移交 dshiunx 插件组。本计划只保留通用阶段；手机相关段落已删除（原文见 `_archive/手机方案/`）。

## 已完成（旧底座，可复用）

- 文本/语音闭环：`jarvis.py`；
- ASR：wetype 独立抽取（`src/asr/`）；
- TTS：Edge-TTS 晓晓；
- 9 个工作 skill：notes / tasks / dispatch / system / screen / memory / audit / voice / core；
- 专用提示词 + skill 隔离（`config/jarvis_system.md`）；
- daemon 状态机（`src/daemon.py`，旧触发 SIGUSR1 已废弃）。

## 移交后（待需求）

插件组切分、桌面 UI、Shell 集成、统筹对话——见 [移交](../../历史/移交/node.md) 与 [技术选型](../../../工作模块/技术选型/node.md)。

## 通用阶段（不依赖手机）

| 阶段 | 内容 | 状态 |
|---|---|---|
| 0 | 信息流骨架 + 最小闭环（文本 → 路由 → 助手 → TTS） | ✅ 已跑通 |
| 1 | 笔记库读写（rg 检索 + 读 + 写 inbox） | ✅ 最小实现 |
| 2 | 事务录入（捕获 → 写 inbox） | ✅ 最小实现 |
| 3 | 任务分配（`pi -p` / `pi --session`） | ✅ 最小实现 |
| 4 | 系统控制（hyprctl / subprocess） | ✅ 最小实现 |
| 5 | 长期记忆（SQLite） | ✅ 最小实现 |
| 6 | 审核追溯（audit.jsonl + backups） | ✅ 最小实现 |
| 7 | 体验 / 统筹对话 / UI | 待需求 |

## 风险

- 语音链路（wetype 在线协议非官方）；
- Python ↔ dshiunx（TS）的边界；
- 长任务分配的边界（不执行长任务）；
- 写入笔记/事务的可追溯。
