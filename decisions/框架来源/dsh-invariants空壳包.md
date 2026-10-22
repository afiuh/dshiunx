# dsh-invariants 空壳包

**父战略**：[框架来源](../README.md)

## 讨论链

1. DSH 源码里没有 `dsh-invariants`，但有包 import 它。
2. 收敛：先写空壳包（导出被 import 的符号），验证能否运行。

## 决定

空壳包；不行再换方案（npm 版 0.2.0-rc.2 或删依赖）。
