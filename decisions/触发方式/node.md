# 触发方式：手机开关 + 电脑端 tiny detector 按需拉起

**父模块**：`../root.md`

## 为什么存在

助手权限高；开关必须随身、可控。电脑端不能常驻完整服务（内存/权限/隐私），但需要一个极小的检测服务接收手机开关，按需拉起完整服务。

## 架构

```
手机 APP（开关 armed/disarmed + 录音按钮）
  │ 局域网 HTTP/WS（token）
  ▼
电脑端 tiny detector（常驻，极低内存）
  ├─ armed → 拉起完整服务 jarvis-daemon
  ├─ trigger → 通知 daemon 开始录音
  └─ disarmed / 心跳超时 → 停止完整服务
        │
        ▼
完整服务（不常驻）：收到 trigger → 录音 → ASR → 助手 → TTS
```

## 核心原则

1. **tiny detector 只做开关/心跳/启停**：不跑语音、不做助手、不执行任意命令；
2. **完整服务不常驻**：只有开关打开时运行；关闭后退出，释放内存/麦克风；
3. **手机断开/心跳超时 → 停止完整服务**（fail-safe）；
4. **token 配对**：只接受手机 APP；局域网；
5. **不全天录音**：disarmed 不采集；armed 只等待手机 trigger；recording 才录音；
6. **内存优先**：tiny detector 用低内存实现（Go/Rust 单二进制优先；Python 可接受但内存更高）。

## 子节点

### 手机 APP

- 配对：电脑 IP/端口/token（技术细节以后再说）；
- 开关：armed/disarmed；
- **录音按钮**：点击 → `POST /trigger` → daemon 开始录音；
- 状态：detector/完整服务状态（armed/recording/processing/speaking）；
- 心跳：定期上报；断联 fail-safe。
- **录音按钮只在手机**；电脑端不放快捷键/按钮。

### tiny detector（常驻）

- **实现：Go 单二进制**（`src/detector/main.go`，仅标准库）；
- 端口：**8387**（8386 已被 mirror-sync 占用）；
- 端点：`GET /health`、`GET /status`、`POST /arm`、`POST /heartbeat`；
- 鉴权：`X-Token`；
- 心跳超时：**60 秒**；
- 职责：接收开关、维护心跳、启动/停止完整服务；
- 不负责：语音/ASR/助手/TTS/文件操作。

### 完整服务生命周期

- 启动：detector 收到 armed；
- 运行：等待手机 trigger；录音/ASR/助手/TTS；
- 停止：detector 收到 disarmed/心跳超时/手机关；
- 退出：停止监听/录音，释放麦克风，进程退出。

### 安全 / 配对

- token 配对；
- detector 只允许启停，不接受任意命令；
- 局域网；
- fail-safe：无心跳 → 停止完整服务；
- 不把 token 写进文档。

### 协议 / 状态

- HTTP/WS：开关、心跳、状态；
- 状态机：disarmed → armed → recording → processing → speaking → armed/disarmed；
- detector 与完整服务之间：进程管理 + 状态上报。

## 边界

- 完整服务不常驻；
- 不做全天录音；
- 不允许手机以外的设备控制；
- 不替代用户判断。

## 验证

- detector 常驻内存低；
- 手机开 → 完整服务启动；关 → 停止；
- 心跳超时 → 完整服务退出；
- 麦克风释放；无残留进程。
