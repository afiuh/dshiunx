# partialReload

**父级**：[热更新](./热更新.md)

## 要做什么

重载单个插件，不重启进程。

## 准备怎么实现

- **清两层缓存**（ESM `loadCache` + CJS `require.cache`）：两种模块格式都要覆盖
- **重建 fiber**（`registry.delete(plugin)` + 新 plugin）：fiber 是生命周期单元

## 决策

1. 清 ESM `loadCache` + CJS `require.cache`
2. 重新 `loader.import` 插件入口
3. `registry.delete(plugin)` + 用新 plugin 重建 fiber
4. 原子重载单元 = 插件入口文件
5. 深层依赖变更会回溯到入口
6. 状态：fiber 重建；Service 实例状态不自动保留（模块级 HMR 的固有限制）
7. 配置对齐：`base` 必须与 `root` 的 cwd 基准一致，否则 `resolve()` 拼错路径、`loadCache` 不命中
8. 配置文件变更：`entries.yml` 修改会触发 loader 的 entry 更新（按 id 比较）；无 id 的条目每次读取生成新 id，会被视为删除 + 添加
9. PENDING 诊断：`ctx.registry.values()` 遍历 fiber，检查 `FiberState.PENDING`
