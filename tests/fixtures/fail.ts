export const name = 'fail'

export function apply() {
  throw new Error('boom')
}
