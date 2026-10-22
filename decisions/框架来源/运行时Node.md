# 运行时确定用 Node

**父战略**：[框架来源](../README.md)

## 讨论链

1. 起点：用户问能不能换运行时（Rust/Go/Bun/Deno）。
2. 调研依据：
   - HMR 依赖 Node 内部 ESM loader（`internal/modules/esm/loader`、`require.cache`）
   - 原生模块 ABI：koffi、node-pty、node-addon-require-builtin
   - Node 22.19 下限：`node:sqlite` + 原生 TS 类型剥离
   - 实测：Node 60MB 二进制、42MB 空 RSS、18–33ms 启动
   - Bun/Deno 不暴露内部 loader，HMR 跑不了
3. 收敛：内核保留 Node，不在运行时上继续纠结。

## 用户原话

> “好吧，那看来这个node是避不开的，那我们就还是用这个内核吧，但是外围应该还有简化的空间吧”

## 决定

- 内核保留 Node
- 外围（arch bundle、插件选择）继续简化

## 影响

HMR 的 `loadCache` / `ModuleJob.linked` 依赖 Node 内部结构；换运行时 = 放弃模块级热更新。
