# 技术选型：方案 A（local-jarvis 底座）

**父模块**：`../root.md`

## 为什么存在

根要求：声音、笔记库读写、事务录入、任务分配（拉起 pi 对话）、系统控制、长期记忆、本地优先。需要确定一个可落地的技术底座和扩展路径。

## 专用初始上下文（2026-10-25）

助手不是编程助手，不能沿用 pi 默认编程上下文。

- 系统提示：`config/jarvis_system.md`（角色/说话方式/行为边界）；
- 调用：`pi --no-context-files --system-prompt config/jarvis_system.md -p ...`；
- **保留 pi 全部工具/技能**（不再 `--no-skills`）；
- `--no-context-files` 只去掉编程 AGENTS.md，不阉割工具；
- 截图：`grim` 截图 → `read` 图片 → pi 视觉回答；
- 长任务分配（`pi_task.py`）仍用默认/项目上下文；
- 测试：截图描述成功；身份“个人电脑助手维叶莎”；普通问答口语化。

## 已定 TTS

**Edge-TTS `zh-CN-XiaoxiaoNeural`（晓晓，女）**：清晰、通用、免费、不占显存。Fairy 音色暂缓，后续需要再换 GPT-SoVITS/RVC。

## 选型结论

以 **Sycatle/local-jarvis** 为底座：

- Linux 原生（Rust、systemd、D-Bus、PipeWire、XDG Portals）；
- 语音链路完整：openWakeWord + Whisper STT + Qwen2.5（llama.cpp）+ Kokoro TTS；
- 技能即工具调用：Rust skill registry + GBNF 约束解码；
- 已有 RAG：`index_docs` 遍历 .md/.txt/.rst/.org，分块、embedding、存 SQLite `facts`；
- 已有长期记忆：SQLite `interactions` / `facts`，支持 embedding；
- 已有系统技能：volume/brightness/launch app/focus window/notify/screenshot；
- 可扩展：skills 是 Rust trait；MCP 配置已留，但 rmcp transport 尚未接通（v1.1 待做）。

## 已确认的能力

| 需求 | local-jarvis 现状 |
|---|---|
| 声音/唤醒 | 复用 wetype-stream 协议脚本做独立 ASR（不经过 fcitx5）+ TTS；不做本地 ASR |
| 笔记库检索 | `index_docs` RAG（只读索引） |
| 笔记库写入 | 需新增 skill（std::fs 读写） |
| 事务录入 | 需新增 skill（调用现有事务系统/脚本） |
| 任务分配 | 需新增 skill（调用 `pi -p` / `pi --session`） |
| 系统控制 | 已有 launch/focus/notify/screenshot/volume/brightness；无任意 shell |
| 长期记忆 | SQLite interactions/facts；可扩展 |
| 中文 | 输入法已处理中文/纠错/降噪；TTS 需选中文方案 |

## 扩展点

1. **语音输入接入**：复用 fcitx5-vinput（Alt+Z 说话出字），助手从输入框/剪贴板/活动窗口取文本；不接本地 ASR。
2. **笔记库读写 skill**：Rust trait，读/写/追加/搜索；路径限制在笔记库根；写入记录 git 或备份。
3. **事务 skill**：调用现有事务系统的脚本/TOML；语音 → 结构化 → 写入。
4. **pi 分配 skill**：`tokio::process::Command` 调用 `pi -p` 或 `pi --session <id>`；同步等待或后台；返回结果给 TTS。
5. **系统控制扩展**：在 system skills 增加“执行命令”或“打开文件”；用户负责，不做二次确认。
6. **长期记忆扩展**：把笔记库/事务/项目状态写入 `facts`；用 embedding 检索；定期清理/遗忘。
7. **中文 TTS**：Kokoro 中文不支持则换 edge-tts/Piper 中文 backend（TTS trait 可替换）。

## 实现路径

### P0：跑通底座（先验证）

- 克隆/编译 local-jarvis（Rust stable，`cargo build --release --features cuda`）；
- 下载模型（Qwen2.5/Kokoro/openWakeWord/Silero VAD；不做本地 ASR）；
- 配置 `~/.config/jarvis/config.toml`；
- 验证：按键/唤醒 → fcitx5-vinput 出字 → 取文本 → Qwen 回答 → TTS；麦克风/GPU/PipeWire 正常。

### P1：笔记库（RAG + 读写）

- 用 `index_docs` 索引笔记库（先只读检索）；
- 新增笔记读写 skill（读/写/追加/搜索）；
- 验证：语音“查一下思维元控制”“在草稿里记一条……”；写入可追溯。

### P2：事务录入

- 新增事务 skill：语音 → 结构化（时间/地点/人物/动作）→ 写入现有事务系统；
- 验证：一条事务从语音到入系统，手打字数下降。

### P3：任务分配（pi）

- 新增 pi skill：判断/按用户指令调用 `pi -p` 或 `pi --session`；
- 长任务交给专门 pi 对话，助手不自己执行；
- 验证：语音“让负责机票的对话查一轮价格”能拉起对应会话。

### P4：系统控制 + 长期记忆 + 中文 TTS

- 扩展 system skills（打开应用/文件/执行命令）；
- 长期记忆写入/检索/遗忘策略；
- 中文 TTS 替换/确认；
- 验证：语音控制电脑、跨会话记住项目/偏好。

## 风险 / 待确认

- local-jarvis 是 alpha；Rust 开发成本；
- 语音输入法接入方式：输入框/剪贴板/活动窗口取文本，需确认 fcitx5-vinput 的输出路径；
- MCP transport 未接通，不能直接接 Obsidian MCP/pi MCP；需要写 Rust skill 或等 v1.1；
- TTS 中文：Kokoro 中文支持不确定；备选 edge-tts（在线不占显存）/Piper/CosyVoice；
- 系统命令 skill 需要权限/审计；用户说不二次确认，但要有记录；
- pi 分配是同步等待还是后台，需要按任务定；
- 笔记库写入范围/格式需与现有笔记库规范对齐。

## 验证

- P0 语音链路可跑通；
- P1 语音查/写笔记；
- P2 语音录事务；
- P3 语音拉起 pi 对话；
- P4 系统控制/长期记忆可用；
- 手动成本下降，用户纠正次数下降。
