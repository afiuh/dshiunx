/** 启动/落地页状态（信息层）：launchpad 输入、onboarding、star 弹窗。 */
type StarModal = { index: number; phase: 'ask' | 'done' } | null
type SdkPhase = { kind: string } & Record<string, unknown>

let launchpadDraft = ''
let launchpadCaret = 0
let launchpadFocus = -1
let launchpadUpdateAvailable = false
let onboardingPending = false
let starred = false
let starModal: StarModal = null
let sdkPhase: SdkPhase = { kind: 'idle' }
let token: string | null = null
let workspaceTargets: readonly unknown[] = []
const listeners = new Set<() => void>()
const notify = (): void => { for (const listener of listeners) listener() }

export const bootStore = {
  getLaunchpadDraft: (): string => launchpadDraft,
  setLaunchpadDraft(value: string): void { launchpadDraft = value; notify() },
  getLaunchpadCaret: (): number => launchpadCaret,
  setLaunchpadCaret(value: number): void { launchpadCaret = value; notify() },
  getLaunchpadFocus: (): number => launchpadFocus,
  setLaunchpadFocus(value: number): void { launchpadFocus = value; notify() },
  getLaunchpadUpdateAvailable: (): boolean => launchpadUpdateAvailable,
  setLaunchpadUpdateAvailable(value: boolean): void { launchpadUpdateAvailable = value; notify() },
  getOnboardingPending: (): boolean => onboardingPending,
  setOnboardingPending(value: boolean): void { onboardingPending = value; notify() },
  getStarred: (): boolean => starred,
  setStarred(value: boolean): void { starred = value; notify() },
  getStarModal: (): StarModal => starModal,
  setStarModal(value: StarModal): void { starModal = value; notify() },
  getSdkPhase: (): SdkPhase => sdkPhase,
  setSdkPhase(value: SdkPhase): void { sdkPhase = value; notify() },
  getToken: (): string | null => token,
  setToken(value: string | null): void { token = value; notify() },
  getWorkspaceTargets: (): readonly unknown[] => workspaceTargets,
  setWorkspaceTargets(value: readonly unknown[]): void { workspaceTargets = value; notify() },
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
