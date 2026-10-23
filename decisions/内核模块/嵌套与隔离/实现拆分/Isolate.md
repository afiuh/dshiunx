# Isolate

**父级**：[嵌套与隔离](../嵌套与隔离.md)

## 要做什么

服务怎么隔离（scope 继承 + label）。

## 参考什么

- 源码：`packages/cordis-plugin-loader/src/config/isolate.ts`

## 决策

1. **isolate 插件**（`isolate.ts:71`）：`ctx.isolate(name, label?: symbol)` 创建独立的服务 scope；同名 label 合并作用域
2. **子 scope 不强制继承 root**（D40 修正）：服务查找是全局 store（按 isolate 标签），`owner = ctx` 也能看到宿主服务
3. **Realm 两种**：
   - `LocalRealm`：`isolate: { name: true }`，suffix `#<entryId>`，本 entry 独有
   - `GlobalRealm`：`isolate: { name: 'label' }`，suffix `@<label>`，同 label 的 entry 共享
4. **isolate 的 label 语义**：`true` = 局部隔离；**symbol** = 按 label 合并作用域（同名 label 的两个 isolate 看到同一个服务）
