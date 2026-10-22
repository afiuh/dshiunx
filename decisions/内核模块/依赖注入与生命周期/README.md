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

## 处理顺序（按依赖分组，不必线性）

**硬前置**
- Context：所有文件都依赖它，必须先定

**可并行**
- Service + Reflect：服务定义与服务访问是一体两面，可以一起研究
- Fiber：依赖 Context + Service，可与 Service/Reflect 并行推进（只要服务语义先定）

**最后**
- Registry：组装层，依赖前四个

实际安排可以跳、可以并行、可以回头补；只要不违反依赖方向。

## 下一级拆分

暂不再拆。如果某个文件（如 Fiber.md）的决策多到出现可独立讨论的子模块，再升级成文件夹。
