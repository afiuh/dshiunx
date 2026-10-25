/**
 * conversations —— 对话管理插件（dshiunx 同级插件，不属于维叶莎）。
 *
 * 记录对话 ID，按「插件」分组（哪个插件引出的对话，归哪一组）。
 * 存储：~/.local/share/jarvis/sessions.json（JSON，可读可改）。
 */
import { Service, type Context } from '@deepseek-ai/cordis'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

export const name = 'conversations'

const FILE = join(process.env.HOME ?? '.', '.local', 'share', 'jarvis', 'sessions.json')

export interface SessionEntry {
  /** 会话 id（dshiunx session id）。 */
  readonly id: string
  /** 引出该对话的插件（如 jarvis-web / jarvis-voice / jarvis-dispatch）。 */
  readonly group: string
  /** 创建时间（epoch ms）。 */
  readonly createdAt: number
  /** 可选标题（用户/插件给的显示名）。 */
  readonly title?: string
}

interface Store {
  entries: SessionEntry[]
  /** 每组当前的会话 id。 */
  current: Record<string, string>
}

const EMPTY: Store = { entries: [], current: {} }

/** 对话管理服务。 */
export class Conversations extends Service {
  private store: Store = EMPTY
  private ready?: Promise<void>

  constructor(ctx: Context) {
    super(ctx, 'conversations')
    this.ready = this.load()
  }

  /** 登记一条对话（重复 id 覆盖标题/分组）。 */
  async register(entry: SessionEntry): Promise<void> {
    await this.ready
    const rest = this.store.entries.filter(item => item.id !== entry.id)
    this.store = { entries: [...rest, entry], current: { ...this.store.current, [entry.group]: entry.id } }
    await this.save()
  }

  /** 设为某组的当前会话。 */
  async setCurrent(group: string, id: string): Promise<void> {
    await this.ready
    this.store = { ...this.store, current: { ...this.store.current, [group]: id } }
    await this.save()
  }

  /** 某组当前的会话 id。 */
  current(group: string): string | undefined {
    return this.store.current[group]
  }

  /** 列出对话（可按组过滤），新的在前。 */
  list(group?: string): SessionEntry[] {
    const entries = group === undefined ? this.store.entries : this.store.entries.filter(item => item.group === group)
    return [...entries].sort((a, b) => b.createdAt - a.createdAt)
  }

  /** 按组归并（给 UI 用）。 */
  groups(): Record<string, SessionEntry[]> {
    const result: Record<string, SessionEntry[]> = {}
    for (const entry of this.list()) (result[entry.group] ??= []).push(entry)
    return result
  }

  /** 删除一条对话记录。 */
  async remove(id: string): Promise<void> {
    await this.ready
    this.store = {
      entries: this.store.entries.filter(item => item.id !== id),
      current: Object.fromEntries(Object.entries(this.store.current).filter(([, value]) => value !== id)),
    }
    await this.save()
  }

  private async load(): Promise<void> {
    try {
      const raw = await readFile(FILE, 'utf8')
      const parsed = JSON.parse(raw) as Partial<Store>
      this.store = { entries: parsed.entries ?? [], current: parsed.current ?? {} }
    } catch {
      this.store = EMPTY
    }
  }

  private async save(): Promise<void> {
    await mkdir(dirname(FILE), { recursive: true })
    await writeFile(FILE, JSON.stringify(this.store, null, 2))
  }
}

export function apply(ctx: Context): void {
  new Conversations(ctx)
}
