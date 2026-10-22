import { Service } from '@deepseek-ai/cordis'

export const name = 'value-provider'

export class ValueService extends Service {
  tag: string

  constructor(ctx: any, config: any) {
    super(ctx, 'value')
    this.tag = config?.tag ?? 'none'
  }
}

export function apply(ctx: any, config: any) {
  ctx.plugin(ValueService, config)
}
