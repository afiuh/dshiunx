# 插件加载

**父级**：[内核模块](../README.md)

## 负责什么

loader / include / 配置校验：配置树怎么读、模块怎么 import、插件怎么实例化。

## 相关源码

`packages/cordis-plugin-loader/src/`、`packages/cordis-plugin-include/src/`

## 决策

1. **Loader 是 EntryTree 的子类**：拥有 entry 树 + 持久化钩子（`write()` 由子类实现）。
2. **`import(name)`**：模块说明符 → ESM 模块；`cordis:` 前缀走 `builtins`（内建插件）。
3. **`unwrapExports`**：归一 ESM / CJS / default 导出形状。
4. **树操作**：`create` / `remove` / `update`，每次操作写回配置。
5. **`internal/config` 钩子**：对 entry 的 config 做 `!!js` 表达式插值（树载体 Group/Include 跳过）。
6. **`internal/update` 钩子**：配置变更时把 fiber 的 config 写回 `entry.options.config`（用 `Config.simplify` 反向序列化）。
7. **`internal/plugin` 钩子**：fiber 创建时绑定 entry；用户自 dispose 时把 entry 标记 `disabled` 并写回。
8. **`Service.check`**：`await` 拦截——loader 条目未加载完时，依赖者保持 pending。
9. **`locate(fiber)`**：找 fiber 所属的 entry id。
10. **`exit()`**：宿主钩子，用于全量重启（HMR 的 external 变更）。

11. **Config schema 验证**：插件导出 `Config`（Standard Schema），loader 在 `apply` 前调用 `resolveConfig` 验证；未提供字段用 schema 默认值补齐；失败抛 `ValidationError`，fiber 进入 `FAILED`。
12. **Volatile 字段**：`.volatile()` 标记的字段，变化时更新稳定引用、**不重挂插件**；通过 `.get()` 读取；变化经 `loader/volatile-update` 事件通知（参数是变化路径）；loader 比较配置时忽略 volatile 字段。
13. **`!!js` 适用范围**：仅在 `config` 与 `disabled` 字段内有效；`disabled` 在每次挂载决策时基于 loader 上下文求值；其余元数据（`name`、`id`、`inject`）保持静态。
14. **明确报错**：配置无效时 `ValidationError: invalid config: ...`；fiber 进入 FAILED；宿主启动器打印错误并以非零状态退出。

## 与 DSH 成熟代码的差异

`diff -r` 结果：我们的 loader 与 `deepseek-harness/vendor/loader` **行为完全一致**，唯一差异是 `index.ts` 一处类型断言（`as unknown as Record<...>`，为 tsc 通过）。属**设计前提**，无行为差异。

## 与 Registry 的边界

| | Registry（依赖注入与生命周期） | Loader（本模块） |
|---|---|---|
| 管什么 | 内存中的插件注册表：`ctx.plugin()`、runtime、fiber 列表 | 从配置/文件到插件的路径：读 entries、import 模块、调 `ctx.plugin()` |
| 关键 API | `plugin()` / `inject()` / `delete()` / `values()` | `import()` / `create()` / `entries()` / `unwrapExports()` |
| 一句话 | “插件已经在内存里，我管它的实例” | “插件还在配置里，我把它变成实例” |

## 硬约束

- 加载不做版本验证（P7）
- 单个 entry 的失败被隔离，不阻塞其他条目
