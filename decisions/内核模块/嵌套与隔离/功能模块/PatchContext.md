# PatchContext

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 要做什么

isolate map 变更时的七步流程。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`（`loader/patch-context`）

## 决策

**`loader/patch-context` 七步**：
1. 生成新 isolate map
2. 计算服务 diff
3. 设置原型 + swap
4. reload fiber
5. 迁移服务实现（同 delimiter）
6. reflect notify
7. 清理 delimiter
