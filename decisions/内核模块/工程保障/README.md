# 工程保障

**父级**：[内核模块](../README.md)

**性质**：非运行时机制——不提供内核能力，而是保证前 7 个运行时模块的契约不被破坏。

## 负责什么

类型严格性、依赖边界、测试策略、API 文档、差异登记。

## 决策

1. **核心包开 `strict`**：`cordis` / `cordis-plugin-*` / `cosmokit` / `schemastery` 的 tsconfig 开启 `strict: true`。
2. **依赖边界规则**：`.dependency-cruiser.cjs` 增加硬规则——`packages/cordis*` 不得依赖 `packages/dsh-*` / `packages/tui*`；内核不知道任何具体插件。
3. **测试策略**：内核契约必须有测试——时间/空间可组合性、嵌套（2 层+）、isolate（Local/Global）、配置验证、事件 5 种模式、HMR 替换。
4. **API 文档**：对外契约（`ctx` / `Service` / `Fiber` / loader 配置）必须有说明；内部实现细节不承诺稳定。
5. **差异登记**：与 DSH 的每一处差异必须登记（原因 + 位置），上游更新时逐项对齐。
6. **类型债**：不允许 `as unknown as` 之类的断言；必要时用类型守卫或 `Reflect.get` 替代。

## 验收

| # | 判据 |
|---|---|
| 1 | 核心包 `tsc --strict` 0 错误（当前 48 个，待修：39 索引签名 / 4 EffectRunner 类型 / 5 递归推断） |
| 2 | `dependency-cruiser` 对内核规则 0 违规 |
| 3 | 内核契约测试全部通过 |
| 4 | 与 DSH 的差异清单可查、每项有原因 |
| 5 | 内核无 `as unknown as` 断言 |

## 与核心战略的关系

- P1：内核最小、干净——工程保障是“干净”的检查手段
- P7：无版本门槛——边界检查不引入版本验证
