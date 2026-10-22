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

## 处理顺序

1. **Context**——地基，其余 4 个都依赖它
2. **Service**——先定义“服务是什么”，后面才能谈“怎么访问”“怎么注册”
3. **Reflect**——服务怎么被 `ctx.get()` 拿到（Proxy 语义），依赖 Service
4. **Fiber**——一个插件实例的生命周期单元，依赖 Context + Service
5. **Registry**——把插件、fiber、服务组织起来，依赖前四个

**为什么 Reflect 先于 Fiber**：Fiber 的 effect 和 dispose 会通过 ctx 访问服务，先定清楚服务访问语义，Fiber 的生命周期才没有歧义。

**为什么 Registry 最后**：它是把前面四个机制组装成“插件系统”的那一层，依赖最深。

## 下一级拆分

暂不再拆。如果某个文件（如 Fiber.md）的决策多到出现可独立讨论的子模块，再升级成文件夹。
