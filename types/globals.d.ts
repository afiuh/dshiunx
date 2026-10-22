declare module 'picomatch' {
  const picomatch: any
  export default picomatch
}

declare module 'js-yaml' {
  export function load(input: string, options?: any): any
  export function dump(input: any, options?: any): string
  export const JSON_SCHEMA: any
  export class Type {
    constructor(tag: string, options: any)
  }
}

declare module '@babel/code-frame' {
  export function codeFrameColumns(source: string, location: any, options?: any): string
}
