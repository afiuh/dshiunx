# 插件化

**父模块**：`../node.md`

## 状态：除渲染外已拍板（2026-10-25）

用户指出：AI 本来就有文件/命令能力，很多插件设计可能多余。
插件/skill 的划分已拍板；渲染模块形态待确认。

## 已拍板（用户明确说过）

| 决策 | 依据 |
|---|---|
| 一切皆插件（P2） | 用户："那我们一切皆插件在搞什么" |
| 插件是契约，不是语言 | 用户："都是插件" |
| `jarvis-voice` 接口 `transcribe(pcm)` + `speak(text)` | 用户："3.可以" |
| `jarvis-dispatch` 依赖 `ctx.agent` | 用户："这个插件到时候肯定是依赖DSHiunx本身的智能体的" |
| 不做 `jarvis-chat` | 用户："当时还没考虑到做插件，那应该就是重复的了" |
| 记忆暂缓（民间插件） | 用户："记忆插件不是官方插件，是民间自己做的插件" |
| 回滚用 git | 用户："回滚功能那就用git" |

## skill 分组与可见性（2026-10-25 用户定）

**skill 要分组，不同对话能看到的 skill 不同。**

- **分组**：按功能分组（`notes` / `tasks` / `system` / `audit` / `dispatch`），每组一个 provider 或一组 runtime skill。
- **可见性**：在 **agent scope** 上注册（`agentCtx.skills.register`）——不同对话/agent 只看到自己 scope 的 skill。
- **机制**：`ctx.skills.register()` 自动按 `scopeOf(this.ctx)` 分层；读取时 `SkillViewOptions.scope` 选层（`dsh-skill/src/index.ts:439-459`）。
- **默认**：全局层放通用 skill；agent 层放该对话专属 skill。

## 已拍板（2026-10-25 补充）

| 决策 | 用户原话 |
|---|---|
| **插件只有 `jarvis-voice` 一个** | "1.是" |
| **`notes` / `tasks` / `system` / `dispatch` 改为 skill**（audit/screen 合并，core/voice/memory 删除） | "2.要" |
| **意图路由由 agent 承担**（不单独做插件） | "3.是" |
| **skill 的详细清单见 [执行能力/skill](../../执行能力/skill/node.md)**（不另问） | "这个能力清单还要问吗，合着之前我们做能力清单白做了吗" |

## 待确认（未拍板）

1. 渲染模块形态（TUI / Web / Shell 内 / 暂不做）？

## 已实现（事实，不是决策）

- `jarvis-voice` 插件：`packages/jarvis-voice/`（TS + Python sidecar）
- 验证：`transcribe` 闭环 + `speak` 出声（`scripts/test-jarvis-voice.ts`）
