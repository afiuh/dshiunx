/** dshiunx 依赖边界：TUI 插件组之间不允许反向依赖。 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      from: {},
      to: { circular: true },
    },
    {
      // index <-> plugin is type-only (Config) + a dynamic import of the
      // implementation; it cannot cycle at runtime.
      name: 'no-circular-index-plugin',
      severity: 'ignore',
      from: { path: '^packages/dsh-tui/src/dsh-adapter/(index|plugin)\.ts$' },
      to: { circular: true },
    },
    {
      name: 'tui-core-no-ui',
      severity: 'error',
      comment: 'tui-core（渲染引擎）不得依赖 UI 组件',
      from: { path: '^packages/dsh-tui/src/ink' },
      to: { path: '^packages/dsh-tui/src/(components|screens)' },
    },
    {
      name: 'ui-no-backends',
      severity: 'error',
      comment: 'UI 层不得依赖 backends',
      from: { path: '^packages/dsh-tui/src/(components|screens)' },
      to: { path: '^packages/dsh-tui/src/backends' },
    },
    {
      name: 'adapter-no-ui',
      severity: 'error',
      comment: 'adapter 不得依赖 UI',
      from: { path: '^packages/dsh-tui/src/adapter' },
      to: { path: '^packages/dsh-tui/src/(components|screens)' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
