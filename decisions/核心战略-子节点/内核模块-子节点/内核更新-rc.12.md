# 内核更新：Cordis rc.11 → rc.12

**父级**：[内核模块](../内核模块.md)

## 要做什么

把 dshiunx 的 cordis 内核从上游 `4.0.0-rc.11` 升到 `4.0.0-rc.12`，同步 loader / include，并适配 include 的导出变化。**产品功能一律不跟**（cua / forge / team / office / desktop / Web UI），**agent-loop 也不碰**——dshiunx 不采用常规智能体循环（见项目 README）。

## 为什么要做

两条理由：

**① rc.12 的语义修正服务 dshiunx 的理念**

| rc.12 的修正 | 为什么重要 |
|---|---|
| `ctx.isolate(name)` 不再回退外层注入 | 隔离变成**真隔离**。dshiunx 的 P3（第 N 层和顶层拥有同样能力）要求作用域边界可信 |
| `inject` 元数据优先级降为最低，`ctx.intercept()` 覆盖它 | 拦截变成**显式**手段，不再靠隐式优先级 |
| 新增 `locate(ctx, name)` | "服务从哪来"变成可查询的一等公民——P2「插件显式」的底层基础 |
| 全局 store 保留（`store: Dict<Impl, symbol>` 按 isolate key 索引） | **D40 的基础没变**，preset 子树可见性不受影响 |

**② 迁移成本可控**

整个 110 包：`ctx.root` 7 处、`Service.config` 1 处（loader）、`Service.resolveConfig` 1 处（loader）。真正的破坏性变化只有一处：include 移除 `entryListSchema` 导出（3 个包 6 处使用）。

> 用户（2026-11-13）：
> "OK，所以需要更新内核，我们先专注于想怎么更新内核"

## 怎么做

### 版本事实（2026-11-13 代码验证）

来源：DSH `vendor/README.md` manifest。**`package.json` 里的 `4.1.0` 是 Harness 发布版本号，不是上游 Cordis 版本。**

| 组件 | rc.1（dshiunx 基线） | rc.3 | 源码差异 |
|---|---|---|---|
| **cordis** | **4.0.0-rc.11** | **4.0.0-rc.12** | ✅ 8 文件 / +151 / -103 |
| loader | 1.0.0-rc.8 | 1.0.0-rc.8 | ✅ `index.ts` 3 处 + `internal.ts` 1 处 |
| include | 1.1.1 | 1.1.1 | ✅ `index.ts`（移除 1 个导出、新增 3 个函数） |
| group / timer / hmr / logger-console | — | — | ❌ 零差异 |
| cosmokit / schemastery | — | — | ❌ 零差异（仓库从 fork 回到上游） |

### 本地修改清单（替换源码后必须重做）

依据 [discussion.md D2/D4](file:///home/ufuish/obsidian-笔记/计算机与编程类/编程记录/dshiunx/discussion.md)：

| # | 修改 | 依据 | 重做成本 |
|---|---|---|---|
| L1 | `main`/`types`/`exports` 从 `lib/*` 改为 `src/index.ts` | **D4** | 保留 package.json，不覆盖 |
| L2 | `workspace:*` / `workspace:~` 改为 `*` | **D4** | 同上 |
| L3 | `const enum` → `enum`（**3 处**：`FiberState`、`LoggerLevel`、`ModulePhase`） | tsx 运行时无导出 | 每处 1 行 |

> **D2**：源码一行不改（原样复制），升级时可直接替换/merge。所以本次更新 = **整体替换 + 重做 L3**。

### 更新清单

#### A 档 · 必须改（不跟就崩 / 编译失败）

| # | 项 | 原因 |
|---|---|---|
| A1 | `ctx.root` → `ctx[Context.root]` | rc.12 删除 `Context.root` 普通属性，只保留 `symbols.root`。旧写法运行时抛 `cannot get property "root" without inject` |
| A2 | `Service.config` → `Service.metadata` | `symbols.config` 已删除，声明拦截类型的服务编译失败 |
| A3 | `[Service.resolveConfig](base?, head?)` → `[Service.resolveIntercept]()` + `[Service.mergeIntercept](...values)` | 合并逻辑拆成两个；loader 的 `[Service.check]()` 直接调用它 |
| A4 | `ctx.isolate(name)` 不再回退外层注入 | 行为变化。**D40 不依赖回退**（它显式传 root 的 isolate 表），所以风险低；HMR 装配后需验证重载窗口期 |
| A5 | `inject` 元数据优先级降为最低 | `fiber.ts` 删掉把 `inject` 写进 `Context.intercept` 的整段逻辑 |
| A6 | `loader/src/index.ts` 3 处跟随重命名 | `declare [Service.config]`、`Service.prototype[Service.resolveConfig]`、`this.ctx.root.logger` |
| A7 | `const enum` → `enum`（3 处） | tsx 下运行时无导出，不改进程起不来 |
| **A8** | **include 移除 `entryListSchema` 导出 → 3 个包 6 处下游适配** | rc.12 把 `entryListSchema` 改成私有 `const schema`，新增 `parseEntryYaml` / `stringifyEntryYaml` / `entryYamlErrorPosition`。**不迁移则编译失败** |
| **A9** | **D40 的 `owner = ctx.root` 语义必须原样保留** | 见下方专节 |

#### B 档 · 源码自带，无额外工作（当前无消费者）

| # | 项 | 判断 |
|---|---|---|
| B1 | `ValidationError.is()` | 单副本 + HMR 未装配 → 冗余。且 brand `Symbol.for('ValidationError')` 与 schemastery **共用是上游一贯设计**，不是新问题 |
| B2 | `locate(ctx, name)` | 无外部调用，但 `reflect.get()` 内部必需，**必须带** |
| B3 | `include` 的 `parseEntryYaml` / `stringifyEntryYaml` | **不再是"无消费者"**——A8 的下游适配正好用它们 |
| B4 | `parallel` 的 AggregateError 带事件名 | 2 处调用，价值可忽略，零成本 |

#### C 档 · 不跟

| # | 项 | 原因 |
|---|---|---|
| C1 | DSH 的 vendor manifest 台账 | 那是 DSH 的发布记录，dshiunx 不是 vendor 模式 |
| C2 | 所有产品功能包 | 与内核无关 |
| C3 | **整个 `dsh-agent-loop`** | dshiunx 不采用常规智能体循环（README），要等决策网络驱动的循环落地 |

### D40 专节：preset 子树服务可见性

**依据**：[discussion.md D40](file:///home/ufuish/obsidian-笔记/计算机与编程类/编程记录/dshiunx/discussion.md)（2026-10-21，核心架构修复）

> **现象**：`tool-bash`/`terminal-bash`/`tool-web`/`tool-workflow` 报 `waiting for shell/sandboxPolicy/web/workflowEngine`，但宿主层都有。
> **根因**：`agent-preset-registry` 的 `owner = ctx`（Include entry ctx），`createScope(owner)` 与宿主 entry 是**兄弟关系**，不继承宿主服务。
> **修复**：`owner = ctx.root`——preset scope 继承 root 的 isolate，能看到所有宿主服务。
> **与 DSH 的等价性**：DSH 的该包在 root 层，`ctx` 本身就是 root；我们的在 Include entry 层，改成 `ctx.root` 等价于 DSH。

**rc.12 不破坏 D40**：

| 项 | D40 的做法 | rc.12 的改动 |
|---|---|---|
| 机制 | **显式**把 root 的 isolate 表传给 preset scope | 取消"查找失败时静默回退" |
| 是否依赖回退 | **否** | 只是收紧失败语义 |
| 全局 store | 保留 | **完整保留**（`reflect.ts:244` 一致） |

**改法：只换语法，不动语义。**

```ts
// 现在（rc.11）
const rootIsolate = ctx.root[Context.isolate]

// 改后（rc.12）——语义 100% 不变
const rootIsolate = ctx[Context.root][Context.isolate]
```

**绝对不能**因为看到"isolate 不回退了"就删掉这行或换写法——会重现当时花 8 轮才定位的 bug（D41 检查清单第 3 条：宿主层有、preset 看不到 = scope 问题）。

### 迁移点清单（代码级，实测）

**cordis 本体（整体替换，8 文件）**
```
src/service.ts    symbols.config → symbols.metadata；resolveConfig → mergeIntercept + resolveIntercept
src/context.ts    root 属性 → [symbols.root]；symbols.config → symbols.metadata
src/registry.ts   InjectKey 的 symbols.config → symbols.metadata；inject 存到 symbols.decorator
src/utils.ts      symbols.metadata → symbols.decorator（internal）；新增 symbols.root；config/resolveConfig → metadata/mergeIntercept/resolveIntercept
src/fiber.ts      删除 inject → Context.intercept 写入；const enum；ValidationError 增强
src/reflect.ts    新增 locate()；get() 改调 locate()
src/events.ts     parallel 的 AggregateError 带事件名
src/logger.ts     const enum
```

**loader（2 文件 / 4 处）**
```
src/index.ts:78    declare [Service.config] → [Service.metadata]
src/index.ts:184   Service.prototype[Service.resolveConfig] → [Service.resolveIntercept]
src/index.ts:191   this.ctx.root.logger → this.ctx[Context.root].logger
src/internal.ts:74 export const enum ModulePhase → enum
```

**include（1 文件 / 1 处本体）**
```
src/index.ts      移除 export const entryListSchema；新增 parseEntryYaml / stringifyEntryYaml / entryYamlErrorPosition
```

**include 下游适配（3 包 / 6 处）**
```
dsh-app-boot/src/index.ts:16            import { entryListSchema } → { parseEntryYaml, stringifyEntryYaml }
dsh-app-boot/src/index.ts:263           const userPatchesSchema = entryListSchema   → 删除
dsh-app-boot/src/index.ts:575           yaml.load(content, { schema: userPatchesSchema }) → parseEntryYaml(content)
dsh-app-boot/src/index.ts:644           yaml.load(content, { schema: entryListSchema })   → parseEntryYaml(content)
dsh-app-boot/src/index.ts:706           yaml.dump(group, { schema: entryListSchema, noRefs: true }) → stringifyEntryYaml(group)
dsh-app-boot/src/config-schema/collect.ts:9,151  import + yaml.load(...) → parseEntryYaml(...)
dsh-agent-preset-registry/src/index.ts:6,226     import + dump(plugins, { schema: entryListSchema, noRefs: true, lineWidth: -1 }) → stringifyEntryYaml(plugins, { lineWidth: -1 })
```

**其他下游（3 包 / 4 处）**
```
dsh-settings/src/index.ts:235            ctx.root.loader → ctx[Context.root].loader
dsh-typert-protocol/src/index.ts:269-270 ctx.root.reflect / ctx.root.accessor → ctx[Context.root]
dsh-agent-preset-registry/src/mount.ts:71 ctx.root[Context.isolate] → ctx[Context.root][Context.isolate]  ← D40 关键
```

> **已核实**：`dsh-settings` 导入的 `resolveConfig(runtime, config)` 是 **fiber.ts 的模块级函数**，rc.12 仍在（`fiber.ts:80`），**不需要改**。只有 `Service.resolveConfig` 这个符号方法改了，全项目只在 loader 一处使用。

### 执行顺序（有硬依赖）

```
1  cordis 服务 API 面（service/context/registry/utils）  4 文件
2  cordis 解析与生命周期（reflect/fiber）               2 文件
3  cordis 事件与日志（events/logger）                   2 文件
   ↓ 编译通过后
4  loader（index + internal）                          2 文件 / 4 处
5  include 本体                                        1 文件
6  include 下游适配（app-boot / preset-registry）       3 包 / 6 处
   ↓
7  settings                                            1 处
8  typert-protocol                                     2 处
9  preset-registry（D40 关键）                          1 处
   ↓
全量编译 → 测试 → 提交
```

## 边界

- **不整体升级 DSH**：只同步内核三个包
- **不碰 agent-loop**：等决策网络驱动的循环落地
- **不跟产品功能**：cua / forge / team / office / desktop / Web UI 一律不碰
- **不丢本地修改**：D4 的 package.json 改造 + L3 的 `const enum` 回改
- **不丢 D40**：preset 子树可见性只换语法，语义不动

## 如何验证自己做对了

- `grep -rn "ctx\.root\b" packages/` 在 cordis 之外应为空
- `grep -rn "symbols\.config\|Service\.config\|Service\.resolveConfig" packages/` 应为空
- `grep -rn "entryListSchema" packages/` 应为空
- `grep -rn "const enum" packages/cordis/src packages/cordis-plugin-loader/src` 应为空
- **D40 验证**：启动后 `verify-presets.mts` 全部 ACTIVE，没有 `waiting for shell/sandboxPolicy/web/workflowEngine`
- **隔离验证**：`ctx.isolate('foo')` 作用域内没 provide 时读 `foo` 应抛错，不读到外层值
- **拦截优先级**：对象形式 `inject` 声明元数据 + `ctx.intercept()` 覆盖，读到 intercept 的值
- **YAML 往返**：`parseEntryYaml(stringifyEntryYaml(x))` 与原值一致，`!!js` 节点保持
- 人看：A 档 9 条，每条都能在 rc.1 → rc.3 的源码 diff 里找到对应改动
