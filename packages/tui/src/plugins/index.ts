/** 嵌套 group：tui 插件拆成 4 个独立插件（无限嵌套）。 */
export { name as coreName, apply as coreApply, inject as coreInject } from './core.js'
export { name as commandsName, apply as commandsApply } from './commands.js'
export { name as overlaysName, apply as overlaysApply } from './overlays.js'
export { name as keyboardName, apply as keyboardApply } from './keyboard.js'
