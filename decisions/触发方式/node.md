# 触发方式：手机开关 + 手机拉起电脑端服务

**父模块**：`../root.md`

## 为什么存在

助手权限高；开关必须随身、可控。电脑端服务不能常驻，必须由手机拉起；手机断开，电脑端服务随之关闭。

## 架构

```
手机 APP（开关 armed/disarmed）
  │ 1. SSH（受限命令）拉起电脑端 jarvis-daemon
  ▼
电脑端 jarvis-daemon（不常驻）
  │ 2. 与手机建立 WS/心跳
  │ 3. armed：监听唤醒词；disarmed：停止
  ▼
手机断开/关闭/心跳超时 → daemon 自动退出
```

## 核心原则

1. **手机是唯一开关**：电脑端不提供“常开”；
2. **电脑端助手服务不常驻**：只有手机发起才启动；
3. **断开即关**：手机 APP 关闭/断网/心跳超时 → daemon 停止监听/录音并退出；
4. **sshd 是系统基础服务**：常驻的是 SSH，不是助手；助手 daemon 由手机通过受限 SSH 命令拉起；
5. **不全天录音**：disarmed 不采集；armed 只监听唤醒词；recording 才录音。

## 子节点

### 手机 APP

- 配对：电脑 IP/端口/token（或二维码）；
- 开关：armed/disarmed；
- 状态：armed/recording/processing/speaking；
- 心跳：定期上报；断联 fail-safe；
- SSH 启动：用受限 key 拉起/停止电脑端 daemon。

### 启动通道（SSH 受限命令）

- 手机 APP 内置 SSH 客户端（sshj/JSch）；
- 电脑 `authorized_keys` 限制命令：只允许 `jarvis-daemon` 启动/停止；
- 不开放任意 shell；key 只用于此用途；
- 可选：单独端口/用户。

### 电脑端 daemon 生命周期

- 启动：手机 SSH 触发；
- 运行：连手机 WS/心跳；
- 停止：手机关/断网/心跳超时（默认 30–60s）/手机发 stop；
- 退出：停止监听/录音，释放麦克风，进程退出。

### 安全 / 配对

- token 配对；
- SSH key 受限命令；
- 局域网；
- fail-safe：无心跳 → disarmed/退出；
- 不把 token/密钥写进文档。

### 协议 / 状态

- SSH：启动/停止命令；
- WS/HTTP：心跳、开关、状态；
- 状态机：disarmed → armed → recording → processing → speaking → armed/disarmed。

## 边界

- 不常驻助手服务；
- 不做全天录音；
- 不允许手机以外的设备拉起；
- 不替代用户判断。

## 验证

- 无手机无法启动 daemon；
- 手机开关能启动/停止；
- 手机关/断网 → daemon 在超时内退出；
- 麦克风释放；无残留进程。
