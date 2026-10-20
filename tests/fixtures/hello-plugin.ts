export default {
  name: 'hello',
  apply(ctx: any) {
    ;(globalThis as any).__dshiunx_hello = true
    ctx.effect(() => () => {
      ;(globalThis as any).__dshiunx_hello = false
    })
  },
}
