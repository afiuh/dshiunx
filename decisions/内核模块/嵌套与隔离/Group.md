# Group

**父级**：[嵌套与隔离](./嵌套与隔离.md)

## 为什么需要

插件怎么套插件（group 递归）。

## 准备怎么实现

### 宏观想法

插件套插件用 **group 插件**（`cordis:group`），不是内核特判——因为"一切皆插件"（P2）。

```
Group.init → update(config) → 子 entries（递归）
```

**为什么用插件**：group 本身是插件，可替换/裁剪；内核不需要知道"嵌套"是什么。

### 细节实现

1. **EntryGroup**（`group.ts:6`）：一个 group 的子 entry 列表；`update(config)` 递归创建/删除子 entries
2. **Group 插件**（`group.ts:75`，`cordis:group`）：`Service.init`（`group.ts:86`）里 `update(config)`，把 config 数组挂成子 entries；group 永远 enabled
3. **group 的 config 是字面量**：树载体（Group/Include）不参与 `!!js` 插值，避免把子条目的表达式当成自己的

## 参考什么

- 源码：`packages/cordis-plugin-group/src/`
- 源码：`packages/cordis-plugin-loader/src/config/group.ts`
