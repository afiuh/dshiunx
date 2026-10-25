# 技术选型：dshiunx 插件组（2026-10-25 重写）

**父模块**：`../root.md`

## 为什么重写

原选型（Sycatle/local-jarvis，Rust 底座 + 手机 APP + tiny detector）已废弃：手机方案取消，项目改为 **dshiunx 插件组**。local-jarvis 的语音链路/技能注册表不再作为底座；只参考它的"语音栈"思路。

## 现有可复用资产

| 资产 | 位置 | 用途 |
|---|---|---|
| wetype ASR 独立抽取 | `src/asr/` | 语音 → 文本（在线、不占显存） |
| TTS（Edge-TTS 晓晓） | `src/jarvis.py` 的 `speak` | 文本 → 语音 |
| daemon 状态机 | `src/daemon.py` | 录音 / ASR / 助手 / TTS 流程（旧触发已废弃） |
| 9 个 skill | `skills/` | notes / tasks / dispatch / system / screen / memory / audit / voice / core |
| 极简提示词 | `config/jarvis_system.md` | 不是编程助手、语音不要 Markdown、重要操作先确认 |
| 配置 | `config/weiyesha.env` | 端口 / token（若保留 HTTP） |

## 待定（等第一阶段需求）

| 问题 | 选项 |
|---|---|
| 插件组切分 | voice / chat / sessions / notes / tasks / dispatch / system / memory / audit |
| 语言边界 | Python sidecar（daemon 作子进程）vs 移植 TS |
| UI 形态 | Shell 内 / TUI renderer / Web renderer |
| 语音链路 | 复用 wetype（在线）vs 本地 ASR（后续） |
| 统筹对话 | 会话注册表 + 任务面板 + 结果回传 |

## 历史（已废弃）

原方案 A：local-jarvis 底座（Rust / systemd / D-Bus / openWakeWord / Whisper / Kokoro）+ 手机 APP + tiny detector（Go，8387，60s 心跳）。
原文：`_archive/手机方案/`。

## 语音链路调研（仍有效）

ASR / TTS / 唤醒 / 框架的对比见 [语音链路调研](./语音链路调研.md)（结论：ASR 复用 wetype，TTS Edge-TTS；本地 ASR/克隆暂缓）。
音色调研见 [Fairy音色调研](./Fairy音色调研.md)（暂缓）。
