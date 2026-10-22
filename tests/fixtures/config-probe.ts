import z from '@deepseek-ai/schemastery'

export const name = 'config-probe'
export const Config = z.object({ tag: z.string().default('default') })

export function apply(_ctx: any, config: any) {
  ;(globalThis as any).__config_tag = config.tag
}
