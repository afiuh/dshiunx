# 热更新

**父级**：[内核模块](../README.md)

## 负责什么

HMR：文件变更怎么检测、依赖图怎么分析、模块怎么替换、状态怎么保留。

## 相关源码

`packages/cordis-plugin-hmr/src/`

## 决策

1. **监听**：chokidar `watch(root)`，`ignoreInitial: true`，`ignored` 匹配相对路径。
2. **依赖图**：从 ESM `ModuleJob.linked` 递归收集依赖，跳过 `node:` 和 `node_modules`。
3. **三集合**：
   - `stashed`：变更文件
   - `accepted`：需要重载的模块（变更文件 + 依赖它的模块）
   - `declined`：不重载（externals + 没有 accepted 依赖者的模块）
4. **externals**：入口（`bin/dx.ts`）的静态依赖树；变更 → `loader.exit()` 全量重启。
5. **partialReload**：
   - 清 ESM `loadCache` + CJS `require.cache`
   - 重新 `loader.import` 插件入口
   - `registry.delete(plugin)` + 用新 plugin 重建 fiber
6. **原子重载单元**：插件入口文件；深层依赖变更会回溯到入口。
7. **状态**：fiber 重建；Service 实例状态不自动保留（模块级 HMR 的固有限制）。
8. **配置对齐**：`base` 必须与 `root` 的 cwd 基准一致，否则 `resolve()` 拼错路径、`loadCache` 不命中。
9. **不做版本检查**（P7）。

## 验收

| # | 判据 |
|---|---|
| 1 | 改插件入口 → 对应插件 reload |
| 2 | 改深层依赖 → 重载依赖它的所有插件入口 |
| 3 | 改嵌套 group 内插件 → 对应插件 reload |
| 4 | 改 externals → 全量重启 |
| 5 | reload 后进程不退出、会话不断 |
| 6 | `base` 与 `root` 基准一致（回归：base=../..） |

## 已知限制

- 动态 `import()` 的子模块不在静态 `linked` 图里，变更可能追踪不到
- Service 内部运行时状态（进行中的流等）在 reload 时丢失
