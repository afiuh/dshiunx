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

## 状态（2026-10-25 已实现并验证）

- `transcribe(pcm)` → **"今天下午3点提醒我买牛奶。"**（闭环：edge-tts 生成 → ffmpeg 转 16k PCM → wetype ASR）
- `speak(text)` → Edge-TTS 晓晓 → mp3 → mpv/pw-play（**出声 ok**）
- 验证脚本：`dshiunx/scripts/test-jarvis-voice.ts`
- 插件加载：`cat jarvis-voice` → `disabled: false`；`dx -p` 正常

## 代码位置

- 插件：`dshiunx/packages/jarvis-voice/`
- Python sidecar：`packages/jarvis-voice/python/`（`asr/`、`transcribe.py`、`speak.py`）
- 原样参考：`vendor/jarvis/src/asr/`、`vendor/jarvis/src/jarvis.py` 的 `speak`
