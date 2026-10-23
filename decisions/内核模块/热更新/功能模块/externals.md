# externals

**父级**：[热更新](../热更新.md)

## 要做什么

定义“什么变更必须全量重启”——入口的静态依赖树。

## 准备怎么实现

- **externals = `bin/dx.ts` 的静态依赖树**：改引导代码 = 重启
- **缩小 externals**：`bin/dx.ts` 只留引导，业务逻辑全走 loader（扩展路线）

## 参考什么

- 源码：`packages/cordis-plugin-hmr/src/index.ts` 的 externals 判断
- 入口：`bin/dx.ts` 的静态依赖树

## 决策

1. externals 变更 → `loader.exit()` 全量重启
2. 当前 externals：`bin/dx.ts` 的静态依赖树
3. 扩展方向：缩小 externals（引导代码最小化）

## 边界

| 能热更 | 不能热更（externals） |
|---|---|
| 插件入口 / 深层依赖 / 嵌套 group | 引导代码（`bin/dx.ts` 静态依赖） |
