# 移交：维叶莎 → dshiunx 插件

**父模块**：`../../../root.md`

## 决策（2026-10-25）

- **手机 APP 方案废弃**：静默、看不到文本、操作空间小；
- **改为桌面软件**，作为 **dshiunx 插件** 做；
- 本项目不再由 `01a171f6` 负责，交给负责 dshiunx 的对话 `01a159e5`。

## 已有成果（可复用）

- wetype ASR 独立抽取：`src/asr/`；
- Edge-TTS 晓晓：`src/jarvis.py` 的 `speak`；
- daemon 状态机/录音/ASR/助手/TTS：`src/daemon.py`；
- 9 个工作 skill：`skills/`（notes/tasks/dispatch/system/screen/memory/audit/voice/core）；
- 极简提示词：`config/jarvis_system.md`；
- 决策网络：`decisions/`（根/技术选型/触发/信息流/实施计划/命名）。

## 已删除（手机相关）

- `android/`：APP 源码、构建产物、APK、图标/启动画面；
- `src/detector/`：手机开关/心跳/触发小服务；
- `scripts/start-detector.sh`、systemd user service；
- 手机截图/临时产物。

## 交接给 dshiunx

- 桌面 UI/插件形态、交互、操作面板；
- daemon API/触发方式改造（桌面按钮/文本/语音）；
- 语音链路实测、TTS 播放问题；
- 部署/体验/验收。

## 保留

- `config/weiyesha.env`（端口/token 可复用）；
- `src/daemon.py`、`src/jarvis.py`、`src/wake_normalize.py`；
- `skills/`、`decisions/`、`vendor/`。

## 状态

已移交 ｜ 2026-10-25
