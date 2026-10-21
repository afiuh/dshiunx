/** 插件边界：TUI 协议 + 入口（暂时包装整个 dsh-tui apply）。 */
export * from '../../dsh-tui/src/adapter/index.js'
export * from '../../dsh-tui/src/dsh-adapter/index.js'
export { name, inject, apply } from '../../dsh-tui/src/index.js'
