# 嵌套与隔离

**父级**：[内核模块](../README.md)

## 负责什么

group / isolate / scope / EntryTree：插件怎么套插件、服务怎么隔离、子 scope 怎么继承 root。

## 相关源码

`packages/cordis-plugin-group/src/`、`packages/cordis-plugin-loader/src/config/{group,isolate,tree}.ts`

## 决策

1. **EntryTree**：entry 的树形存储 + 遍历（`entries` / `resolve` / `create` / `update` / `remove`）；`resolve(id)` 按 `:` 分段逐层下降。
2. **EntryGroup**：一个 group 的子 entry 列表；`update(config)` 递归创建/删除子 entries。
3. **Group 插件**（`cordis:group`）：`Service.init` 里 `update(config)`，把 config 数组挂成子 entries；group 永远 enabled。
4. **Entry.id**：父 id 前缀拼接（`父:子`），保证树内唯一。
5. **isolate 插件**：`ctx.isolate(name, label)` 创建独立的服务 scope；同名 label 合并作用域。
6. **子 scope 必须继承 root**（D40）：否则子树看不到宿主服务。
7. **group 的 config 是字面量**：树载体（Group/Include）不参与 `!!js` 插值，避免把子条目的表达式当成自己的。

## 与 Entry 的边界

| | 插件加载 | 嵌套与隔离（本模块） |
|---|---|---|
| 管什么 | 单个 Entry 的配置、diff、import、实例化 | EntryTree 的组织、Group 的递归、Isolate 的 scope 继承 |
| 关键类型 | `Entry`、`EntryOptions`、`Loader` | `EntryGroup`、`Group`、`EntryTree`、`isolate()` |
| 一句话 | “一个节点怎么变成插件” | “节点之间怎么组成树、服务怎么隔离” |

## 硬约束

- 嵌套深度不设限
- 每层子插件拥有同样的内核能力（P3 功能无限）
