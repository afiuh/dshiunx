# externals

**父级**：[热更新](../热更新.md)

## 要做什么

定义“什么变更必须全量重启”——入口的静态依赖树。

## 准备怎么实现

### 宏观想法

框架入口（`bin/dx.ts`）的静态依赖是**热更的边界**——改这些文件不能只重载插件，必须全量重启。

```
bin/dx.ts 的静态依赖树 = externals → 变更 → loader.exit() 全量重启
```

**为什么是入口**：`bin/dx.ts` 是引导代码，改它等于改框架，插件级重载不够。

### 细节实现

1. **收集 externals**：启动时从入口 `mainJob.linked` 递归收集（`loadDependencies(mainJob)`，`hmr/src/index.ts:117`）
2. **检查**：`change` 时 `externals.has(url)`（`:136`）→ `loader.exit()` 全量重启
3. **为什么是入口**：`bin/dx.ts` 是引导代码，改它等于改框架，插件级重载不够
4. **扩展方向**：缩小 externals（`bin/dx.ts` 只留引导，业务逻辑全走 loader）


## 参考什么

- 源码：`packages/cordis-plugin-hmr/src/index.ts` 的 externals 判断
- 入口：`bin/dx.ts` 的静态依赖树

## 决策

1. externals 变更 → `loader.exit()` 全量重启（`hmr/src/index.ts:58/61`）
2. 当前 externals：`bin/dx.ts` 的静态依赖树
3. 扩展方向：缩小 externals（引导代码最小化）

## 边界

| 能热更 | 不能热更（externals） |
|---|---|
| 插件入口 / 深层依赖 / 嵌套 group | 引导代码（`bin/dx.ts` 静态依赖） |
