# jarvis-voice

**父模块**：`../node.md`

## 接口

- `ctx.jarvisVoice.transcribe(pcm: Buffer): Promise<string>` —— 16k mono s16le PCM → 文本
- `ctx.jarvisVoice.speak(text: string): Promise<void>` —— 文本 → Edge-TTS → 播放
- 触发（按键/Shell 命令）由调用方负责，不在本插件内

## 依赖

- 无 dshiunx 服务依赖（sidecar 独立）
- Python：`src/asr/wetype_asr.py`（transcribe）、`src/jarvis.py` 的 `speak`

## 边界

- 不做路由（不知道"笔记/事务"）
- 不做录音（调用方给 PCM；录音是触发层的事）
- 不做唤醒词（P0）
- 不做本地 ASR（wetype 在线）

## 验证

- 给一段 PCM → 正确文本（"今天下午三点提醒我买牛奶"）
- `speak("你好")` → 听到语音
- 卸载插件 → `dx` 仍启动

## 现有代码

`src/asr/`、`src/jarvis.py` 的 `speak`、`config/weiyesha.env`（若需要）。
