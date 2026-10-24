# Shell 插件

**父级**：[具体插件](../具体插件.md)

## 为什么需要

登录 dshiunx 后需要一个"系统本身"——不是对话界面，是能启动 / 装配 / 打开程序的命令层。主题（[核心战略 §2.0](../../../核心战略.md)）：**welcome** 要求默认有能用的起点；**anything** 要求能力靠插件叠加，不预设用法。

## 准备怎么实现

### 宏观想法

```
登录 dx → shell（命令 REPL）
            ├─ 读一行 → 匹配命令 → 执行
            ├─ 命令来自插件（注册表）
            └─ 内置只有 exit / help
```

**为什么 shell 不硬编码 `tui` / `web` / `run`**：它们都是插件。shell 只提供"命令注册 + 分发"的机制；装什么插件就有什么命令。这符合 P2（一切皆插件）和主题（不预设用法）。

### 细节实现

1. **形态**：`@dshiunx/shell` 插件，`name = 'shell'`；提供 `ctx.shell` 服务（命令注册表 + 输入循环）。
2. **命令注册**：`ctx.shell.register(name, { description, run })`；插件在 `apply` 里注册自己的命令（`tui` / `web` / `plugin` / `run` …）。
3. **内置命令**：只有 `exit`（退出）和 `help`（列出已注册命令）——它们是 shell 自身的控制流，不是应用。
4. **输入循环**：`node:readline/promises` 读一行 → 按首个空格切命令名 + 参数 → 分发；未知命令报 `unknown command: x (try help)`。
5. **退出**：`exit` → 统一 `shutdown(0)`（复用 `bin/dx.ts` 的 dispose → exit 路径）。
6. **默认 profile**：`default: shell`；想直接进 TUI 就配 `default: tui`（启动链路读 profile 决定先打开哪个 renderer）。
7. **与对话命令的区别**：agent 的 slash 命令（`/compact`）走 `dsh-commands` 的 `ctx.commands`，在对话内；shell 命令是系统命令，两者不混。

### 命令集（Arch 风格，2026-10-24 用户定）

**插件即文件**——shell 用文件命令，不发明"插件管理"词汇。

| Arch | 我们的 | 实现 |
|---|---|---|
| `ls` | `ls` 列插件（id / 状态 / 名称） | `ctx.loader.entries()` |
| `cat <file>` | `cat <id>` 看插件（name / inject / config） | `entry.options` |
| `systemctl status` | `status` 运行状态（插件数 / disabled / pending） | `entries` + `fiber.state` |
| `pacman -S / -R` | `install` / `remove` | plugin-manager（插件注册） |
| `systemctl enable/disable` | `enable` / `disable` | profile patch（插件注册） |
| `journalctl` | `log` | 未来 |
| `man` | `help [cmd]` | 内置 |
| 打开程序 | `tui` / `web` / `run "task"` | renderer / headless（插件注册） |

**内置（shell 自己）**：`ls` / `cat` / `status` / `help` / `exit`。
**插件注册**：`install` / `remove` / `enable` / `disable` / `run` / `tui` / `web`。

### 启动界面（主题展示，2026-10-24 用户定）

方案 B：小字 ASCII + 主题句 + 提示行。

```text
     _    _    _
  __| |__| |_ (_)_  _ _ _ __ __
 / _` (_-< ' \| | || | ' \\ \ /
 \__,_/__/_||_|_|\_,_|_||_/_\_\

  welcome to dshiunx, you can do anything
  type `help` for commands, `exit` to leave.
```

- **字体**：figlet `Small`（约 32 列，80 列终端不换行）
- **颜色**：logo 用 dim 灰；主题句用 cyan；提示行用更暗的灰（两级，不彩虹）
- **时机**：启动显示一次；`help` 可再看；空会话保留
- **不做**：逐字动画、框线、彩色渐变（不打扰原则）
- **输出原则**：**没有报错就没有输出**（Arch 式，[核心战略 §2.0](../../../核心战略.md)）。

### 启动输出分级（Shell 插件自己负责）

| 输出 | 级别 / 条件 | 理由 |
|---|---|---|
| 启动失败 / 插件加载失败 / 配置错误 | `error` / `warn` | 用户需要知道 |
| `hmr watching ...`（正常启动） | `debug`（Shell 启动时把该 logger 降到 debug） | 正常状态，不是信息 |
| `dx: loaded N entries` | 仅 `DX_VERBOSE=1` | 调试信息，不是用户关心的 |
| 主题句 + 提示符 | 默认 | 唯一的正常启动输出 |

**判据**：默认启动只有主题句 + 提示符；任何"正常状态"的日志都不该出现在 info 级别。这条原则归 Shell（界面插件）管，不归内核日志机制管——内核 `logger` 只负责"级别怎么过滤"，不负责"什么时候该静默"。

### 边界

| shell 负责 | 不负责 |
|---|---|
| 命令注册表 + 输入循环 + 分发 | 对话（TUI / Web 的事） |
| 内置 `exit` / `help` | 插件管理逻辑（plugin-manager 的事） |
| 启动时打开 default renderer | 渲染（renderer 插件的事） |

### 验证

- `dx` 启动 → 显示主题句 + 提示符
- `help` 列出当前已注册命令
- 装 TUI 插件 → `tui` 命令出现；卸掉 → 命令消失
- `exit` → 走统一 shutdown（dispose → exit 0）
- 默认 profile 配 `default: tui` → 启动直接进 TUI

## 参考什么

- `packages/dsh-commands`（命令注册表的 `NamedEntries` 模式）
- `bin/dx.ts`（统一退出 `shutdown`）
- [核心战略 §2.0](../../../核心战略.md)（主题）
