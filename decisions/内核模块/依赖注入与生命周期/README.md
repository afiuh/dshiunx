# 依赖注入与生命周期

**父级**：[内核模块](../README.md)

## 负责什么

Context / Fiber / Effect / Service / Registry / Reflect：服务怎么注册、查找、随生命周期创建和销毁。

## 相关源码

`packages/cordis/src/{context,fiber,registry,service,reflect}.ts`

## 这一级拆成哪几个文件

| # | 文件 | 负责什么 | 依赖 |
|---|---|---|---|
| 1 | [Context.md](./Context.md) | 根上下文、`ctx.extend`、`ctx.root`、`baseUrl` | — |
| 2 | [Service.md](./Service.md) | Service 基类、生命周期符号、callable | Context |
| 3 | [Reflect.md](./Reflect.md) | 服务访问的 Proxy、trace、reactive | Context、Service |
| 4 | [Fiber.md](./Fiber.md) | 状态机、effect、dispose、runtime | Context、Service |
| 5 | [Registry.md](./Registry.md) | inject / provide / get、插件注册、服务查找 | Context、Service、Reflect、Fiber |

## 审查顺序（按理解依赖，不是按实现顺序）

代码已存在，本阶段是审查。读懂代码的顺序仍然是：

1. **Context**——地基，其余 4 个都依赖它
2. **Service**——先理解“服务是什么”
3. **Reflect**——服务怎么被 `ctx.get()` 拿到
4. **Fiber**——一个插件实例的生命周期单元
5. **Registry**——把插件、fiber、服务组织起来

但这只是“读懂代码”的顺序，不是“写代码”的顺序；实际审查可以从问题最密集的文件开始。

## 下一级拆分

暂不再拆。如果某个文件（如 Fiber.md）的决策多到出现可独立讨论的子模块，再升级成文件夹。
