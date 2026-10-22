import z from '@deepseek-ai/schemastery'

export const name = 'volatile-probe'
export const Config = z.object({ tag: z.string().default('a').volatile() })

export function apply(ctx: any, config: any) {
  ;(globalThis as any).__volatile_tag = config.tag.get()
  ;(globalThis as any).__volatile_remounts = ((globalThis as any).__volatile_remounts ?? 0) + 1
  ctx.on('loader/volatile-update', () => {
    ;(globalThis as any).__volatile_updated = config.tag.get()
  })
}
