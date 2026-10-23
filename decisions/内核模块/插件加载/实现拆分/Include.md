# Include

**父级**：[插件加载](../插件加载.md)

## 为什么需要

文件-backed EntryTree（配置从文件来）。

## 准备怎么实现

### 宏观想法

文件-backed EntryTree：配置从 YAML/JSON/JS 文件来，可热更。

```
文件 → 解析 → root.update → 写回（原子写）
```

### 细节实现

1. **Include 是文件-backed EntryTree**：支持 YAML / JSON / JS
2. `path` 相对 `ctx.baseUrl` 解析
3. **initial 写入**：文件不存在（ENOENT）时写 `initial`
4. 文件存在但解析失败必须报错，不能当成缺失
5. **只读检测**：`access(W_OK)` 失败 → readonly；只读时不覆盖文件
6. **refresh 容错**：重读文件，内容变化才 `root.update`；解析失败只 warn，保留旧树
7. **原子写**（`include/src/index.ts:298-305`）：写临时文件 + `rename`；EACCES/EBUSY/EPERM 重试（10 次，递增延迟）；写操作串行化

## 参考什么

- 源码：`packages/cordis-plugin-include/src/`
