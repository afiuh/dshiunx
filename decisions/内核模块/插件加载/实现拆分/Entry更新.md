# Entry 更新

**父级**：[插件加载](../插件加载.md)

## 要做什么

配置变更时增量更新 entry（不重启）。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/entry.ts:120`（`update`）

## 宏观想法

配置变更时增量更新 entry（不重启）：整体替换或增量合并。

```
update(options) → 更新 options（create 整体替换 / 否则增量合并 + sortKeys）
  → disabled? → dispose fiber
  → 有 fiber:
     计算 changes → volatileOnly? → _commitVolatile
                  → 否则 partial-dispose + _patchContext
  → 无 fiber: init()
```

## 准备怎么实现

### 细节实现

1. **`Entry.update` 路径**：`create` 时整体替换 options，否则增量合并 + `sortKeys`
2. `disabled` → dispose fiber
3. 有 fiber 时计算 changes：volatile-only 走 `_commitVolatile`，否则 `loader/partial-dispose` + `_patchContext`
4. 无 fiber → `init()`
5. **`init` 去重**：`_initTask` 保证并发 init 只跑一次；`_init` 失败只 `logger.error`，不创建 fiber
6. **`internal/update` 钩子**：配置变更时把 fiber 的 config 写回 `entry.options.config`（用 `Config.simplify` 反向序列化）
7. **`internal/plugin` 钩子**：fiber 创建时绑定 entry；用户自 dispose 时把 entry 标记 `disabled` 并写回（只处理用户自 dispose，其余 5 种跳过）
