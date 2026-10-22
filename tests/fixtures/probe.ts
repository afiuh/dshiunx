export const name = 'probe'

export function apply(ctx: any, config: any = {}) {
  const tag = config.tag ?? 'default'
  ;(globalThis as any).__probe = [...((globalThis as any).__probe ?? []), tag]
  ctx.effect(() => () => {
    ;(globalThis as any).__probe = ((globalThis as any).__probe ?? []).filter((t: string) => t !== tag)
  })
}
