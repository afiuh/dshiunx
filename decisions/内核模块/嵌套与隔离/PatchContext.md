# PatchContext

**父级**：[嵌套与隔离](./嵌套与隔离.md)

## 为什么需要

isolate map 变更时的七步流程。

## 准备怎么实现

### 宏观想法

isolate map 变更时，服务实现要**迁移**到新 scope——七步保证不丢服务。

```
patch-context → 生成新 map → diff → swap → reload fiber → 迁移实现 → notify → 清理
```

**为什么七步**：服务实现挂在旧 map 上，直接换 map 会丢；必须迁移 + 通知依赖者。

### 细节实现

**`loader/patch-context` 七步**（`isolate.ts:96`，step 7 在 `:147`）：
1. 生成新 isolate map
2. 计算服务 diff
3. 设置原型 + swap
4. reload fiber
5. 迁移服务实现（同 delimiter）
6. reflect notify
7. 清理 delimiter

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`（`loader/patch-context`）
