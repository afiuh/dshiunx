# LSP 工具

**父级**：[工具](../工具.md)

## 要做什么

给模型 `lsp` 工具：查定义、查引用、查实现、看 hover——精确的代码导航。

## 为什么要做

读代码需要"跳转"能力，纯 grep 不够：grep 给的是文本匹配，LSP 给的是语义位置。

## 怎么做

### 代码事实（2026-11-07 验证）

`packages/dsh-tool-lsp/`（2 个源文件，436 行）：

| 文件 | 职责 |
|---|---|
| `index.ts` | `lsp` 工具定义 |
| `render.ts` | 结果渲染（locations / hover） |

### 工具定义（代码验证）

```ts
name: 'lsp'
description: 'Query a language server for precise code navigation. operation is one of goToDefinition, findReferences, goToImplementation, hover. line and character are one-based UTF-16 cursor coordinates. findReferences includes the declaration.'
parameters: {
  operation: 'goToDefinition' | 'findReferences' | 'goToImplementation' | 'hover',
  file_path: string,
  line: number,       // 1-based
  character: number,  // 1-based UTF-16
}
output: { kind: 'locations', locations: [{ uri, range }] } | { kind: 'hover', ... }
```

- 提示词注入：`ctx.systemPrompt.section({ name: 'tool:lsp', text: LSP_PROMPT_TEXT })`
- 有 `timeoutMs` 配置

### 底层（代码验证）

`packages/dsh-lsp/src/`：`index.ts`、`types.ts`、`brand.ts`——LSP capability seam（`ctx.lsp`）。

### 装配状态（代码验证）

**未装配**：`grep -c "lsp" packages/bundle-arch/entries.yml` = 0。

说明 LSP 工具已实现，但当前 arch bundle 没装它。

## 边界

- **不做代码编辑**（那是 fs 工具）
- **不做语言服务器管理**（启动/关闭由 `dsh-lsp` 管）
- **只读**：`lsp` 是 read-only 工具

## 如何验证自己做对了

- 查一个符号的定义，返回位置（uri + range）
- 查引用，返回多处，包含声明
- hover 返回规范化后的内容
- `grep -c "lsp" packages/bundle-arch/entries.yml` = 0（未装配）
- 人看：工具是否只有"operation + 位置 → 查询 → 渲染"
