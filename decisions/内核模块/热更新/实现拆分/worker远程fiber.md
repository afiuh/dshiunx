# worker 远程 fiber

**父级**：[热更新](../热更新.md)

## 要做什么

让 worker 插件也能热更，且不重启 worker。

## 准备怎么实现

### 宏观想法

worker 插件也要能热更，且不重启 worker——**单 cordis + 远程 fiber**：主进程有 fiber，worker 只跑代码，ctx 是 RPC 代理。

```
主进程：唯一 cordis（fiber/服务/事件）
  └── worker：只跑插件代码 + 持有 native 句柄
```

### 细节实现

1. **远程 fiber**：插件在主进程有 fiber；`ctx` 是 RPC 代理（`get`/`provide`/`emit`/`effect`/`dispose`）
2. **生命周期在主进程**：服务/事件全在主进程，worker 不维护 cordis
3. **HMR 一套**：主进程检测变更 → 通知 worker 重新 `import` → 主进程重建 fiber
4. **worker 内 HMR**：`--expose-internals` + `loadCache.delete` + 重新 import（已验证，2026-10-22）
5. **为什么不选多 cordis 主从**：registry/loader/HMR 都要维护两套，成本翻倍


## 架构

```
主进程：唯一 cordis
├── 普通插件（本地 fiber）
└── worker 插件（远程 fiber）
    └── worker：只跑插件代码，没有 cordis
```

## 参考什么

- DSH：`docs/architecture.md`（in-process 挂载）
- DSH：`plugin-manager` README（安装审批替代运行时隔离）
- 原型：2026-10-22 worker HMR 验证（`--expose-internals`）

## 决策

1. 插件在主进程有 fiber；`ctx` 是 RPC 代理（`get` / `provide` / `emit` / `effect` / `dispose`）
2. 生命周期、服务、事件全在主进程
3. HMR 只有一套：主进程检测变更 → 通知 worker 重新 `import` → 主进程重建 fiber
4. worker 只负责“执行代码 + 持有 native 句柄”
5. worker 内 HMR 已验证可行（`--expose-internals` + `loadCache.delete` + 重新 import）

## 为什么 DSH 没有 worker 插件机制

| 事实 | 出处 |
|---|---|
| 插件是 in-process 挂载 | `docs/architecture.md` |
| 隔离靠 sandbox，不隔离插件 | `docs/architecture.md` |
| 第三方插件在进程内运行、无沙箱 | `plugin-manager` README |
| 安全模型 = 安装审批 | 同上 |

**结论**：不是“DSH 信任插件”，而是“DSH 用安装审批替代运行时隔离”。dshiunx 的 AI 自动写插件没有审批环节，所以需要运行时隔离。

## 性能

| 方式 | 单次调用 |
|---|---|
| in-process | 0.023µs |
| worker RPC | 7.3µs（**314x**） |

对工具级调用（毫秒级）可忽略；对高频事件（每 token）会累加 → 分级隔离，不全量 worker。
