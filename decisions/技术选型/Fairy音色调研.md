# Fairy（绝区零）音色 TTS 调研

**父模块**：`../技术选型/node.md`

## 结论

有现成的 Fairy 音色资源，分三类：

1. **GPT-SoVITS 模型包**（本地 TTS，最合适）；
2. **RVC 模型**（变声，不是 TTS；可给 TTS 输出变声）；
3. **Fish Audio 在线模型**（可直接生成/API，非本地）。

## 1. GPT-SoVITS 模型包

- 来源：B站「白菜工厂1145号员工」《绝区零全角色GPT-SoVITS模型分享》；
- 规模：25 个角色，更新至 1.0，持续更新；
- 下载：
  - 百度网盘：`https://pan.baidu.com/s/1x_THJNAZU-aExdAKfCUdbg?pwd=1145`
  - 123 盘：`https://www.123pan.com/s/UHp9-kqi8H.html`
- 在线体验（可能维护中）：`https://tts.acgnai.top/`
- **Fairy 是否在 25 个角色里：未确认**；需要下载模型包看目录/试听。
- 优点：本地、免费、GPT-SoVITS 生态成熟；缺点：需要确认模型质量/版本兼容。

## 2. RVC 模型

- 来源：RVC 模型工坊《绝区零全角色RVC模型》；
- 明确列出 **Fairy**；
- 性质：RVC 是**变声/语音转换**，不是文本转语音；需要先有 TTS 输出，再转成 Fairy 音色；
- 适合：已有 TTS（Edge-TTS/CosyVoice）→ RVC 变声；
- 缺点：多一步、延迟增加；音色转换质量依赖模型。

## 3. Fish Audio 在线模型

- 页面：
  - `https://fish.audio/zh-CN/m/f8db038da1c34a4c9749f56a1d463fa2/`
  - `https://fish.audio/ja/m/235851fae0da43309a9973fe7285a823/`
- 性质：在线 Fairy AI 语音生成器；可能支持 API/付费；
- 优点：开箱即用、音色现成；缺点：依赖网络/账号/费用，非本地。

## 推荐路径

### 首选：GPT-SoVITS 本地

- 下载模型包，确认是否含 Fairy；
- 用 GPT-SoVITS 推理，接 local-jarvis/助手的 TTS；
- 若模型质量差，用 Fairy 语音片段自己微调/零样本克隆。

### 备选：CosyVoice 2 / Fish Speech 零样本克隆

- 找 Fairy 的干净语音片段（游戏语音/剧情）；
- 用 CosyVoice 2 或 Fish Speech 做零样本克隆；
- 优点：音色可控；缺点：需要参考音频，版权风险。

### 兜底：Edge-TTS + RVC 变声

- Edge-TTS 生成中文语音；
- RVC 转成 Fairy 音色；
- 优点：TTS 稳定；缺点：延迟/链路复杂。

## 版权提醒

- Fairy 音色版权属于米哈游/配音演员；
- 仅个人非商业使用；不要公开发布模型/商用/冒充官方；
- 下载站也多注明“非商业、不拥有版权”。

## 待确认

- GPT-SoVITS 模型包是否包含 Fairy；
- 模型质量/参考音频是否干净；
- 本地推理显存/延迟（GPT-SoVITS 6GB+ 显存）；
- 是否接受 RVC 变声的额外延迟；
- 在线 Fish Audio 是否符合隐私/成本要求。
