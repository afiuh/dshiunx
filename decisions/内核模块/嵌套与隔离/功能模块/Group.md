# Group

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 要做什么

插件怎么套插件（group 递归）。

## 参考什么

- 源码：`packages/cordis-plugin-group/src/`
- 源码：`packages/cordis-plugin-loader/src/config/group.ts`

## 决策

1. **EntryGroup**（`group.ts:6`）：一个 group 的子 entry 列表；`update(config)` 递归创建/删除子 entries
2. **Group 插件**（`group.ts:75`，`cordis:group`）：`Service.init`（`group.ts:86`）里 `update(config)`，把 config 数组挂成子 entries；group 永远 enabled
3. **group 的 config 是字面量**：树载体（Group/Include）不参与 `!!js` 插值，避免把子条目的表达式当成自己的
