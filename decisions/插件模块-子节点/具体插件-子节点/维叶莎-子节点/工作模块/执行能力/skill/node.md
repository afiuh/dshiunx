# skill

**父模块**：`../node.md`

## 归属（2026-10-25 修正）

维叶莎 skill 走 **dshiunx 的 skill 机制**（`ctx.skills`），不是 pi 的 `--skill`。

- 位置：`vendor/jarvis/skills/`（现有 9 个 `jarvis-*`）；
- 加载：dshiunx 的 `ctx.skills.register`（agent scope）；
- 与 pi 的关系：**无关**——pi 的 skill（`~/.pi/agent/skills/` 的 madd/decision-network 等）不参与维叶莎；
- 隔离：不放进 `~/.pi/agent/skills/`（避免 pi 误加载），但也不需要 pi 的 `--skill`；
- 验证：dshiunx agent 能看到 `jarvis-*`；pi 的技能列表里不出现。

## 先分清两类

- **skill**：AI 读的“怎么做事”的流程规范（dshiunx 的 `ctx.skills`）；
- **运行时服务**：语音、ASR/TTS——在 dshiunx 里是插件（不是 skill）。

## 维叶莎 skill 清单（4 个）

### 1. jarvis-notes（笔记库）

- 何时用：查笔记、读笔记、写/更新笔记；
- 职责：搜索、读取、写入、更新、引用检查；
- 写入规则：默认写 `草稿集/AI草稿/jarvis-inbox.md`；写入前 `git commit`（回滚 = `git revert`）；不静默覆盖；
- 边界：路径限制在笔记库；写入可追溯。

### 2. jarvis-tasks（事务）

- 何时用：用户说"记事务/待办/提醒"；
- 职责：捕获 → 结构化（时间/动作/优先级）→ 写入 inbox；
- 写入规则：写入前 `git commit`（回滚 = `git revert`）；先捕获不自动归档；
- 边界：不静默改正式事务表。

### 3. jarvis-system（系统控制 + 截图）

- 何时用：打开应用/文件、执行命令、窗口/媒体/音量、截图看屏；
- 职责：执行系统操作；截图 → 读图 → 回答；
- 写入规则：危险操作前 `git commit`（可回滚）；有记录；
- 边界：按用户指令；不物理移动系统目录；敏感文件红线；按需截图不常驻。

### 4. jarvis-dispatch（任务分配）

- 何时用：长任务、编程、完整项目、多步实现；
- 职责：从活跃项目台账找负责对话，用 `pi --session` 拉起/继续；结果回传；
- 边界：不自己执行长任务；按用户明确指令分配；不替用户决定。

## 已删除 / 合并（2026-10-25）

| 原 skill | 处理 | 理由 |
|---|---|---|
| `jarvis-core`（意图路由） | 删除 | 意图路由由 agent 承担 |
| `jarvis-voice`（语音交互） | 删除 | voice 是插件（`jarvis-voice`），不是 skill |
| `jarvis-memory`（长期记忆） | 删除/暂缓 | 复用民间插件 `dsh-memento` |
| `jarvis-audit`（审核/追溯） | 合并 | 回滚用 git；"写入前 commit"写进 notes/tasks/system |
| `jarvis-screen`（屏幕/视觉） | 合并 | 截图/看屏属于系统控制 |

## 不建议做成 skill 的

- 语音链路：dshiunx 插件（jarvis-voice）；
- 人格/语气：初始提示词；
- 工具清单（不是 skill）。

## 状态（2026-10-25）

✅ 4 个 skill 已挂到 `~/.agents/skills/`（notes / tasks / system / dispatch），dshiunx agent 可见。
✅ 验证：`记事务：明天下午三点买牛奶` → agent 找到 inbox、识别重复、不重复写入（按 skill 规则）。

## 待确认

- 每个 skill 的独立目录/触发词/工具映射细节。
