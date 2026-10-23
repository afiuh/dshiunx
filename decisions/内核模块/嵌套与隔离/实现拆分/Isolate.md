# Isolate

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 为什么需要

服务怎么隔离（scope 继承 + label）。

## 准备怎么实现

### 宏观想法

服务要**隔离**（不同 scope 的同名服务互不可见），但同 label 要**共享**。所以 `ctx.isolate(name, label)` 创建独立 scope。

```
isolate(name, label?: symbol) → 新 isolate map → scope
```

**为什么 label 是 symbol**：symbol 全局唯一，避免字符串冲突；同 symbol 合并作用域。

### 细节实现

1. **isolate 插件**（`isolate.ts:71`）：`ctx.isolate(name, label?: symbol)` 创建独立的服务 scope；同名 label 合并作用域
2. **子 scope 不强制继承 root**（D40 修正）：服务查找是全局 store（按 isolate 标签），`owner = ctx` 也能看到宿主服务
3. **Realm 两种**：
   - `LocalRealm`：`isolate: { name: true }`，suffix `#<entryId>`，本 entry 独有
   - `GlobalRealm`：`isolate: { name: 'label' }`，suffix `@<label>`，同 label 的 entry 共享
4. **两层 label 语义**（容易混淆）：
   - `entry.options.isolate?: Dict<true | string>`：`true` = `LocalRealm`；**string** = `GlobalRealm`（按 label 合并）
   - `ctx.isolate(name, label?: symbol)`（Context 层）：label 是 **symbol**，同名 symbol 合并作用域
   - 决策 3 的 `isolate: { name: 'label' }` 里的 label 是 **string**（Entry 配置），不是 symbol

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`
