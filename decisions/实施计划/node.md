# 实施计划

**父模块**：`../root.md`

## 目标

从“单次脚本”到“开关一开、叫名字就能用”的电脑助手维叶莎；手机 APP 最后。

## 已完成（阶段 0）

- 文本/语音闭环：`jarvis.py`；
- ASR：wetype 独立抽取；
- TTS：Edge-TTS 晓晓；
- tiny detector：Go，8387，60s 心跳；
- 9 个工作 skill：notes/tasks/dispatch/system/screen/memory/audit/voice/core；
- 专用提示词 + skill 隔离。

## 阶段 1：语音唤醒闭环（P0）

### 1.1 jarvis-daemon

- 状态机：`disarmed → armed → recording → processing → speaking`；
- 常驻进程：等待按键/快捷键触发、录音、VAD、ASR、助手、TTS；
- 由 detector 启动/停止；心跳超时退出；
- 产出：`src/daemon.py`（或 Go/Rust 服务）。

### 1.2 触发方式（方案 A）

- 手机开关打开 → 按键/快捷键/信号触发录音；
- 复用 wetype ASR，不做唤醒词；
- P0 触发键：Alt+Z（输入法）或 Super+J（助手）；
- 唤醒词移到可选阶段 5，不做进 P0。

### 1.3 detector 联调

- detector 的 `-daemon` 从 `sleep` 换成真实 daemon；
- 开 → 启动；关/心跳超时 → 停止；
- 验证：进程/麦克风释放/无残留。

### 验收

开关开 → 按键说话 → 录音 → ASR → 助手 → TTS；关 → 停止；断网/心跳超时 → 停止。

## 阶段 2：功能 skill 实战（P1）

### 2.1 P0 skill 验证

- notes：查/读/写；
- tasks：记事务；
- dispatch：拉起 pi 对话；
- system：打开应用/执行命令；
- 每个跑一次真实任务，记录问题。

### 2.2 P1 skill 验证

- screen：截图看屏幕；
- memory：跨会话记忆；
- audit：备份/回滚；
- 修正触发/边界/开放原则。

### 2.3 路由统一

- `jarvis-core` 路由表 vs `jarvis.py` 代码路由；
- 避免重复/冲突；明确哪些走代码、哪些走 pi skill。

### 验收

每个 skill 至少一次真实任务成功；无误触发；用户纠正次数可接受。

## 阶段 3：手机 APP（P2，最后）

### 3.1 电脑端 API

- detector 补配对/状态/心跳接口；
- token 鉴权；状态回传；
- fail-safe：断联 60s → 停止 daemon。

### 3.2 Android APP

- 复用 mirror-sync 的 Kotlin/Compose 工程；
- 页面：配对、开关、状态；
- 心跳；撤销配对；
- 构建 `./gradlew assembleDebug`，adb 安装。

### 3.3 联调

- 手机开关 → 电脑服务；
- 断网/关 APP → 服务停止；
- 状态显示正确。

### 验收

手机随身控制；不开 APP 电脑不监听；断联自动停。

## 阶段 4：体验/部署/验收（P3）

- TTS 流式/打断/延迟；
- detector systemd 自启/日志/权限；
- 端到端验收（真实日常使用）；
- 更新决策网络/项目台账/归档。

## 阶段 5：可选

- Fairy 音色（GPT-SoVITS/RVC）；
- 中文唤醒词（可选，非 P0）；
- 主动提醒/多模态。

## 顺序理由

1. 先闭环：没有 daemon/唤醒，功能 skill 和 APP 都没有入口；
2. 再功能：daemon 能跑后，逐个验证 skill，修正路由；
3. 再 APP：依赖 detector API/配对协议稳定，最后套壳；
4. 最后体验：延迟/打断/流式，避免过早陷入细节。

## 风险

- 按键触发/信号与输入法冲突；
- daemon 与 detector 进程管理/权限；
- ASR/TTS 网络依赖；
- APP 构建环境/配对安全；
- 长任务分配边界。

## 里程碑

- M1：语音唤醒闭环（阶段 1）；
- M2：功能 skill 可用（阶段 2）；
- M3：手机开关可用（阶段 3）；
- M4：日常可用/验收（阶段 4）。
