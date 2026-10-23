# Context

**父级**：[依赖注入与生命周期](./依赖注入与生命周期.md)

## 负责什么

根上下文、`ctx.extend`、`ctx.root`、`baseUrl`：所有 ctx 的起点。

## 相关源码

`packages/cordis/src/context.ts`

## 讨论链

1. 起点：框架从上游 vendor，`Context` 是 cordis 的核心抽象——一个“依赖容器 + 服务代理”。
2. 我们的第一个真实问题（D40）：preset 子树报 `waiting for shell/sandboxPolicy/web`，但这些服务宿主层都有。
3. 根因：`createScope(owner)` 的 owner 用了 entry ctx，导致 preset scope 与宿主 entry 是**兄弟关系**，不继承宿主服务。
4. 收敛：owner 改成 `ctx.root`，子树继承 root 的服务视图。这是“无限嵌套”能成立的前提。

## 决定

1. **root 唯一**：`ctx.root` 指向根上下文；所有子 ctx 共享同一个 root。
2. **子 ctx 用原型继承**：`extend(meta)` 用 `Object.create(self)` + `Object.assign` 覆盖，**不修改父**；保留 `symbols.shadow`（决策 8）。
3. **isolate 是服务作用域**：`isolate(name, label?: symbol)` 创建独立的服务查找 scope；同名 label（**symbol**，不是字符串）的两个 isolate 合并作用域。
4. **intercept 是服务配置拦截**：`intercept(name, config)` 把配置合并到下层插件的服务解析中，不影响父。
5. **baseUrl 是模块解析基准**：每个 entry 可以有自己的 baseUrl，用于解析相对模块说明符。
6. **子 scope 不强制继承 root**（D40 修正）：服务查找是全局 store（按 isolate 标签），`owner = ctx` 也能看到宿主服务；`ctx.root` 补偿已回滚（2026-10-23）。
7. **跨 realm 判断**：`Context.is()` 用全局 symbol（`Symbol.for('cordis.is')`）而不是 `instanceof`，跨 realm / 多份 cordis 副本都能识别。
8. **extend 的 shadow**：`extend` 保留父的 `symbols.shadow`，用于“影子上下文”（服务替换时保持调用链）。
9. **symbol 索引签名**：`Context` 声明 `[key: symbol]: any`，支持 `isolate` / `intercept` / `fiber` / `entry` 等动态 symbol 键。

## 验收

| # | 判据 | 来源 |
|---|---|---|
| 1 | 插件卸载时 `ctx.effect` 的清理函数自动执行（时间可组合性） | 历史决策「测试策略」 |
| 2 | provider 卸载后，inject 它的 consumer 自动停用（空间可组合性） | 历史决策「测试策略」 |
| 3 | 第 N 层子插件与顶层拥有同样的 `ctx` 能力（P3 功能无限） | 核心战略 P3 |
| 4 | 子树能访问 root 的服务（D40 的回归测试） | 历史决策「preset 子树服务可见性」 |

## 排错经验（来自历史）

`waiting for X` 报错先按顺序排查：

1. 包存在吗？
2. 服务在宿主层注册了吗？
3. 宿主层有、子树看不到？→ **scope 问题**，查 `owner` / `createScope`
4. `state=3` 不一定是真失败，先查 `ctx.get('X')` 是否已注册
