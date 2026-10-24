# Realm

**父级**：[嵌套与隔离](./嵌套与隔离.md)

## 为什么需要

realm 的创建/合并/垃圾回收。

## 准备怎么实现

### 宏观想法

isolate 的服务实现要**按 label 管理生命周期**——label 没有 entry 引用时回收。

```
isolate → Realm（Local/Global）→ partial-dispose → GC
```

**为什么按 label**：同 label 的 entry 共享服务实现，一个 label 一个 realm。

### 细节实现

1. **realm 垃圾回收**（`isolate.ts:155`）：`loader/partial-dispose` 时，若没有 entry 再引用某个 label，删除该 realm；realm 空了就删 label
2. **realm 按 label 管理**：`LocalRealm`（`isolate: { name: true }`）本 entry 独有；`GlobalRealm`（`isolate: { name: 'label' }`）同 label 共享

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`（realm 逻辑）
