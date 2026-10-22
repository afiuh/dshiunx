export const name = 'value-consumer'
export const inject = ['value']

export function apply(ctx: any) {
  ;(globalThis as any).__value_tag = ctx.value.tag
}
