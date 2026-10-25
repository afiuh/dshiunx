# Skill 清单（维叶莎工作 skill）

**父模块**：`../root.md`

## 隔离规则（必须）

维叶莎工作 skill **不能**放在 `~/.pi/agent/skills/`，否则正常使用 pi 时会被自动发现/乱触发。

- 位置：`/mnt/data/AI自由工作区/维叶莎/skills/`（项目内，不是全局 skills，也不是 `.pi/skills`）；
- 加载：只有 jarvis 调用 pi 时显式 `--skill <path>`；正常 pi 不加载；
- 可配合 `--no-skills` 禁用自动发现，再显式加载维叶莎 skill；
- 每个 skill 独立目录 + `SKILL.md`；
- 验证：正常 pi 的技能列表里不出现 jarvis-*；jarvis 会话里能加载。

## 先分清两类

- **pi skill**：AI 读的“怎么做事”的流程规范；
- **运行时服务**：语音、detector、手机 APP、ASR/TTS，不是 skill。

## pi skill 清单

### 1. jarvis-notes（笔记库）

- 何时用：查笔记、读笔记、写/更新笔记；
- 职责：搜索、读取、写入、更新、引用检查、审核；
- 边界：写入可追溯；不静默覆盖；路径限制在笔记库；
- 对应工具：notes.py / rg / 文件读写。

### 2. jarvis-tasks（事务）

- 何时用：用户说“记事务/待办/提醒”；
- 职责：捕获 → 结构化（时间/动作/优先级）→ 写入 inbox/事务系统 → 查询/完成；
- 边界：先捕获不自动归档；写入可审核；
- 对应工具：tasks.py / 事务系统文件。

### 3. jarvis-dispatch（任务分配）

- 何时用：长任务、编程、完整项目、多步实现；
- 职责：判断任务类型/长度 → 拉起或继续专门 pi 对话 → 结果回传；
- 边界：不自己执行长任务；按用户明确指令分配；不替用户决定；
- 对应工具：pi_task.py / pi CLI。

### 4. jarvis-system（系统控制）

- 何时用：打开应用/文件、执行命令、窗口/媒体/音量；
- 职责：执行系统操作；返回结果/错误；
- 边界：按用户指令；用户负责；有记录；
- 对应工具：system.py / hyprctl / shell。

### 5. jarvis-screen（屏幕/视觉）

- 何时用：看屏幕、截图、这个窗口、图片；
- 职责：grim 截图 → read 图片 → 回答；
- 边界：按需截图；不常驻截屏；不假装看到未截取内容；
- 对应工具：screen.py / grim / read。

### 6. jarvis-memory（长期记忆）

- 何时用：跨会话记住项目/偏好/事务；用户问“之前…”；
- 职责：记录、检索、注入、更新/遗忘；
- 边界：不记隐私；不主动翻旧账；不污染上下文；
- 对应工具：memory.py / SQLite。

### 7. jarvis-audit（审核/追溯）

- 何时用：写入/修改/系统操作；
- 职责：记录、备份、回滚、审核点；
- 边界：不替代用户审核；不静默改历史；
- 对应工具：audit.py / backups。

### 8. jarvis-voice（语音交互，运行时为主）

- 何时用：录音/唤醒/ASR/TTS/打断；
- 职责：开关 → 按键/快捷键触发 → 录音 → ASR → 助手 → TTS；
- 边界：不全天录音；开关由手机控制；
- 对应：wetype ASR / Edge-TTS / detector / APP（不是纯 skill）。

## 不建议做成 skill 的

- 手机开关 APP、tiny detector、语音链路：运行时服务；
- 人格/语气：初始提示词；
- 能力清单：工具清单。

## 优先级

- P0：jarvis-notes、jarvis-tasks、jarvis-dispatch、jarvis-system；
- P1：jarvis-screen、jarvis-memory、jarvis-audit（已写，项目内 skills/）；
- P2：jarvis-voice（运行时）、手机 APP。

## 待确认

- 这套 skill 是给 pi 读的 SKILL.md，还是给 jarvis.py 路由用的规范？
- 是否每个 skill 都要有独立目录/触发词/工具映射？
- 是否需要 jarvis-core（意图路由）skill，还是路由留在代码里？
