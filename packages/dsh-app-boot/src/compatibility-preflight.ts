/**
 * Profile entry preparation at the composition entry points DSH owns.
 *
 * P7（无版本门槛）：插件与内核只靠结构契约，不做版本判定。
 * 这里只负责把 profile 的 patches 组合成一份 insert，行本身原样返回；
 * 结构问题（不是 bundle、patch 读不出、manifest 缺失）由 Loader 自己报告。
 */
import type { Context } from '@deepseek-ai/cordis'
import type { EntryOptions } from '@deepseek-ai/cordis-plugin-loader'
import { applyEntryPatches, type PatchOptions } from '@deepseek-ai/cordis-plugin-include'

/** Render the patch wording an Include would report, through the profile's logger. */
function patchWarning(ctx: Context): (message: string, ...args: unknown[]) => void {
  return (message, ...args) => {
    let index = 0
    ctx.logger.warn(message.replace(/%C/g, () => JSON.stringify(args[index++])))
  }
}

/**
 * Prepare profile or preset rows before the owning DSH caller passes them to Loader.
 * P7：不做版本判定；行原样返回（结构校验由 Loader 自己负责）。
 * @param ctx Context carrying launcher-owned profile facts.
 * @param entries Complete effective entry list, after patch composition.
 * @param parentURL Resolution base of the tree that will import these rows.
 * @param binName Diagnostic prefix (unused; kept for call-site compatibility).
 * @returns Detached rows.
 */
export function prepareProfileEntries(
  ctx: Context, entries: readonly EntryOptions[], parentURL: string | undefined, binName = 'dsh',
): EntryOptions[] {
  void ctx
  void parentURL
  void binName
  return structuredClone(entries) as EntryOptions[]
}

/**
 * Apply the complete patch composition over a profile's empty root.
 * The caller passes every patch layer of the profile, because this returns one insertion patch for
 * that empty root: a non-empty root config would lose the caller's override patches by id.
 * @param ctx Profile context prepared by the launcher.
 * @param patches Original ordered profile patches; these remain unchanged.
 * @param parentURL Root Include's resolution base.
 * @param binName Diagnostic prefix for a denied row; defaults to `dsh`.
 * @returns One prepared insertion patch for profiles, or the original patches for non-profile callers.
 */
export function prepareProfilePatches(
  ctx: Context, patches: PatchOptions[], parentURL: string, binName = 'dsh',
): PatchOptions[] {
  if (ctx.get('profileContext') === undefined) return patches
  const entries = applyEntryPatches([], patches, patchWarning(ctx))
  const rows = prepareProfileEntries(ctx, entries, parentURL, binName)
  return rows.length === 0 ? [] : [{ insert: rows }]
}
