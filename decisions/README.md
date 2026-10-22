# dshiunx 决策网络

> **真源**：本目录（git 管理）。obsidian 里只留指针。
> **结构**：文件夹嵌套 = 战略 → 战术 → 细节，无限细分，不设固定层数。
> **文件**：一个文件 = 一个决策节点；文件名 = 它主管的模块（不用机器 ID）。
> **文件内部**：1/2/3 编号，讨论链自由叙述。
> **淘汰**：直接删除文件/文件夹；删除原因写进 commit message，git 历史保留现场。

## 战略全景

| 战略 | 目录 |
|---|---|
| 框架来源：vendor 上游，不从零实现 | [框架来源/](./框架来源/README.md) |
| 架构分层：内核 + 插件宿主 | [架构分层/](./架构分层/README.md) |
| 运行时能力：沙箱/审批/指令/复刻 | [运行时能力/](./运行时能力/README.md) |
| Agent 模式：四模式与理解能力 | [Agent模式/](./Agent模式/README.md) |
| TUI：插件化 + 呈现解耦 | [TUI/](./TUI/README.md) |
| AI 操作系统：与 Arch Linux 同构 | [AI操作系统/](./AI操作系统/README.md) |

## 提交约定

```bash
# 决策变更（只改 decisions/）
git commit -m "decision(框架来源/API零改动): ..."

# 代码实现（引用决策路径）
git commit -m "fix(hmr): ... (decisions/框架来源/运行时Node.md)"
```

## 删除约定

```bash
git commit -m "decision(框架来源/旧决策): delete — <原因>"
```

git 历史保留现场：`git log -- decisions/<path>` 可查。
