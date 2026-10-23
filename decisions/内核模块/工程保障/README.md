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
7. **健康心跳**：主进程定期（100ms）更新 SharedArrayBuffer / 心跳文件，供外部 watchdog 监控；内核只提供心跳，不提供监控逻辑。
8. **动态索引签名**：`Context` / `Service` 加 `[key: symbol]: any`，`EntryOptions` 加 `[key: string]: any`——支持 isolate/intercept/fiber/entry 和 patch 动态字段；窄断言只用于 `Disposable` 等无法加索引签名的类型。

## 历史判断验证（2026-10-23 新增）

**历史决策可能记录的是“当时的判断”，不是“事实”。**

| 问题 | 表现 | 处理 |
|---|---|---|
| **历史判断误导** | D40 记录“DSH 的 preset registry 在 root 层”，实际在 Include 里 | 查机制层（`reflect.get` 的查找方式），不只看位置 |
| **补偿不必要** | `owner = ctx.root` 是补偿，回滚后 D40 不复现 | 先确认 DSH 的做法，再决定是否补偿 |
| **数据清洗遗漏** | 插件模块的历史决策没清洗，导致沿用错误判断 | 清洗范围要覆盖所有模块（内核/插件/历史讨论） |

**规则**：
1. 历史决策引用前，先验证机制层（代码/DSH 源码）
2. 补偿前，先确认“不补偿是否真的不行”
3. 数据清洗要覆盖所有模块，不只当前正在做的模块

## 验收

| # | 判据 |
|---|---|
| 1 | 核心包 `tsc --strict` 0 错误 |
| 2 | `dependency-cruiser` 对内核规则 0 违规 |
| 3 | 内核契约测试全部通过 |
| 4 | 与 DSH 的差异清单可查、每项有原因 |
| 5 | 内核无 `as unknown as` 断言 |

## 与核心战略的关系

- P1：内核最小、干净——工程保障是“干净”的检查手段
- P7：无版本门槛——边界检查不引入版本验证
