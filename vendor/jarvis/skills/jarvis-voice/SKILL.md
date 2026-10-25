---
name: jarvis-voice
description: 维叶莎语音交互 skill——开关/唤醒/录音/VAD/ASR/TTS/打断的状态机与边界；不全天录音，开关由手机控制，失败如实报告。
---

# jarvis-voice（语音交互）

## 原则

- 默认做法，不是死板流程；具体情境具体分析。
- 不确定就查：`src/asr/wetype_asr.py`、`src/asr/wetype_streaming.py`、`src/detector/`、`jarvis.py --voice`、系统配置档案、工具手册；查不到就问用户。
- 运行时以代码为准，本文是行为规范。

## 链路

```
手机开关 → tiny detector → 完整服务
  → armed：等待手机录音按钮（POST /trigger）
  → 唤醒：录音 → VAD → ASR（wetype）
  → 助手 → TTS（Edge-TTS 晓晓）→ 播放
  → 回到 armed/disarmed
```

## 两阶段交互

- 用户点手机“唤醒维叶莎”按钮；
- 助手由 AI 生成一句简短回应（不是固定文案）；
- 用户再说任务；
- 不把“名字 + 任务”压在同一句。

## 状态机

- `disarmed`：不采集、不监听、不送 ASR；
- `armed`：只等待手机 trigger，不监听、不存音频；
- `recording`：唤醒后录音，VAD 静音截断；
- `processing`：ASR/助手处理；
- `speaking`：TTS 播放，可打断；
- 开关关/心跳超时 → `disarmed`。

## 运行时

- ASR：`src/asr/wetype_asr.py`（16k mono s16le）；
- 录音：`parec`；TTS：`edge-tts` + `mpv/pw-play`；
- 检测服务：`src/detector`（Go，8387，60s 心跳）；
- 开关：手机 APP（最后做）。

## 电脑端反馈

- 状态变化用 Hyprland 通知：正在听 / 处理中 / 回复中；
- 识别文本/回复摘要显示在通知；
- 不频繁弹 armed/disarmed 通知。

## 录音文件策略

- **录音不落盘**：`record_utterance` 在内存 `bytearray` 中，ASR 通过 stdin 直接发送 PCM；
- 不生成 `.wav/.pcm/.raw` 录音文件；
- TTS 输出固定 `/tmp/jarvis-reply.mp3`，每次覆盖；
- 截图固定 `/tmp/jarvis-screen.png`，每次覆盖；
- 启动/退出清理临时音频/截图；
- 不把音频写进日志/审计。

## 边界

- 不全天录音；`armed` 只等待手机 trigger，不监听；
- 不做本地 ASR；不占显存；
- 失败就报告（麦克风/网络/ASR/TTS）；
- 不假装听到/看到；
- 打断/流式后续优化。

## 验证

- 录音 → 文本 → 回复 → 播放；
- 状态切换正确；
- 开关关/心跳超时后停止采集。
