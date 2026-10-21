/** 模型列表（信息层）：channel 拉取后写入，StatusLine/ModelPicker 读。 */
import type { LlmModelInfo } from '../dsh-adapter/channel.js'

let models: readonly LlmModelInfo[] = []
let loading = false
let providerInfos: readonly unknown[] = []
let presetOptions: readonly unknown[] = []
let effortOptions: readonly unknown[] = []
let effortLevelsFallback = false
let skillsList: readonly unknown[] | null = null
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const modelsStore = {
  get: (): readonly LlmModelInfo[] => models,
  isLoading: (): boolean => loading,
  set(value: readonly LlmModelInfo[]): void { models = value; notify() },
  setLoading(value: boolean): void { loading = value; notify() },
  getProviderInfos: (): readonly unknown[] => providerInfos,
  setProviderInfos(value: readonly unknown[]): void { providerInfos = value; notify() },
  getPresetOptions: (): readonly unknown[] => presetOptions,
  setPresetOptions(value: readonly unknown[]): void { presetOptions = value; notify() },
  getEffortOptions: (): readonly unknown[] => effortOptions,
  setEffortOptions(value: readonly unknown[]): void { effortOptions = value; notify() },
  getEffortLevelsFallback: (): boolean => effortLevelsFallback,
  setEffortLevelsFallback(value: boolean): void { effortLevelsFallback = value; notify() },
  getSkillsList: (): readonly unknown[] | null => skillsList,
  setSkillsList(value: readonly unknown[] | null): void { skillsList = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
