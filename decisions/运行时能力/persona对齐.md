# persona 对齐 DSH base

**父战略**：[运行时能力](../README.md)

## 讨论链

1. 用户问：“为什么是 AI 编程助手？不是没设置特定角色吗”。
2. 检查发现 arch bundle 沿用了 sdk-minimal 的 `personaPrefix: 'You are a helpful software engineer assistant.'`。
3. 对照：DSH `base` 是空字符串；`headless` 是 coding agent。
4. 收敛：对齐 `base`，改为空。

## 决定

`personaPrefix: ''`，保留 `includeHarnessIdentity: true`、`includeRuntimeContext: true`。

## 验证

改后回复变为“你好！有什么可以帮你的吗？”，不再自称“AI 编程助手”。
