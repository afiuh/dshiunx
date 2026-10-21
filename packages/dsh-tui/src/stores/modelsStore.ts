/** 模型列表（信息层）：channel 拉取后写入，StatusLine/ModelPicker 读。 */
import type { LlmModelInfo } from '../dsh-adapter/channel.js'

let models: readonly LlmModelInfo[] = []
let loading = false
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const modelsStore = {
  get: (): readonly LlmModelInfo[] => models,
  isLoading: (): boolean => loading,
  set(value: readonly LlmModelInfo[]): void { models = value; notify() },
  setLoading(value: boolean): void { loading = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
