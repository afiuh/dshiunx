# native 服务封装

**父级**：[热更新](../热更新.md)

## 要做什么

让 native 插件（pty / koffi / sixel）也能热更，不重启进程。

## 准备怎么实现

- **三层边界**（不选直接 import）：`.node` 不能卸载，必须隔离
- **句柄传递**：`serialize` / `restore` 传句柄引用

## 架构

```
插件 JS（经常变）→ 服务接口（稳定）→ native 实现（极少变）
```

| 层 | 变更频率 | 热更方式 |
|---|---|---|
| 插件 JS 代码 | 高 | ✅ 热更 |
| native 句柄（pty/连接） | 不重启 | ✅ `serialize/restore` 引用传递 |
| `.node` 文件 | 极低 | ⚠️ 重启 worker（主进程/会话不断） |

## 参考什么

- DSH：native 插件（`node-pty` / `koffi` / `sixel`）的加载方式
- 内核：`cordis` 的 `ctx.effect`（清理）

## 决策

1. 插件不得直接 `import` native 模块，必须依赖服务接口
2. native 实现隔离在服务里，可独立升级/替换
3. 有状态插件支持 `serialize/restore`

## 结论

日常改代码不重启；只有升级 `.node` 文件才重启 worker——合理边界，不是妥协。
