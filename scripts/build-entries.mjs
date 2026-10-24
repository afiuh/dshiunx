/**
 * 从 profile + bundles/ 组合生成 entries.yml。
 *
 * 生成物必须带清晰标注（AI行为约束：自动生成的文件要能被一眼认出）：
 * 文件头写明生成器、源、重新生成命令、手改后果。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import * as yaml from 'js-yaml'

const OUTPUT = 'packages/bundle-arch/entries.yml'
const profile = yaml.load(readFileSync('profiles/default/profile.yml', 'utf8'))
const parts = profile.bundles.map((b) => readFileSync(`bundles/${b}/cordis.patch.yml`, 'utf8'))

const header = `# ============================================================================
# ⚠️ 自动生成文件，不要手写！
#
# 生成器：scripts/build-entries.mjs（npm run build:entries）
# 源文件：profiles/default/profile.yml + bundles/*/cordis.patch.yml
# 手改后果：下次生成会被静默覆盖；要改配置请改 bundles/ 或 profile patch。
# ============================================================================

`

writeFileSync(OUTPUT, header + parts.join(''))
console.log(`entries.yml generated from ${profile.bundles.length} bundles`)
