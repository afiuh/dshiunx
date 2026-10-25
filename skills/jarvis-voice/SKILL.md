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
