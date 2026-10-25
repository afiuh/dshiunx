# 输入法接入

**父模块**：`../node.md`

## 为什么存在

语音输入复用 fcitx5-vinput；必须把“出字”变成助手可用的文本。

## 输入 / 输出

- 输入：fcitx5-vinput 出字（Alt+Z 说话）；
- 输出：文本（给助手/pi）。

## 边界

- 不做本地 ASR；
- 不截获隐私/不常驻监听键盘；
- 不干扰输入法正常使用。

## 已确认方案（2026-10-25）

直接复用 fcitx5-vinput 的 `wetype-stream` 适配器脚本（微信输入法协议），作为独立 ASR：

- 脚本：`src/asr/wetype_streaming.py`（从 `~/.local/share/vinput/providers/wetype/streaming` 复制）；
- wrapper：`src/asr/wetype_asr.py`；
- 输入：16k mono s16le WAV/PCM；输出：final 文本；
- 不经过 fcitx5/daemon，不影响正常 Alt+Z 输入；
- 实测：“今天下午三点提醒我买牛奶” → “今天下午3点提醒我买牛奶。”

## 边界

- 微信协议非官方，可能失效；
- 需要网络；
- 不做本地 ASR、不占显存。

## 验证

说一句话，助手能拿到正确文本；不干扰正常输入。
