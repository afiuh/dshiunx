# Include

**父级**：[插件加载](../插件加载.md)

## 要做什么

文件-backed EntryTree（配置从文件来）。

## 参考什么

- 源码：`packages/cordis-plugin-include/src/`

## 决策

1. **Include 是文件-backed EntryTree**：支持 YAML / JSON / JS
2. `path` 相对 `ctx.baseUrl` 解析
3. **initial 写入**：文件不存在（ENOENT）时写 `initial`
4. 文件存在但解析失败必须报错，不能当成缺失
5. **只读检测**：`access(W_OK)` 失败 → readonly；只读时不覆盖文件
6. **refresh 容错**：重读文件，内容变化才 `root.update`；解析失败只 warn，保留旧树
7. **原子写**：写临时文件 + `rename`；EACCES/EBUSY/EPERM 重试（10 次，递增延迟）；写操作串行化
