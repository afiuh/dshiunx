/**
 * Linux 空壳：Windows ACL 沙箱在 Linux 上不执行。
 * 仅满足 dsh-sandbox-local 的静态 import；win32 分支不会调用这些实现。
 */
export class AclWriteGrant {
  constructor(..._args: unknown[]) {}
  async dispose(): Promise<void> {}
}
export function assertTempRootOutsideWorkspace(..._args: unknown[]): void {}
export function registerAclDiagnosisSkill(..._args: unknown[]): void {}
export function tempWriteSid(..._args: unknown[]): string { return '' }
export function workspaceWriteSid(..._args: unknown[]): string { return '' }
