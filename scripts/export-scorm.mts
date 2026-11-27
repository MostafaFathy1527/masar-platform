// SCORM 1.2 export (prototype): one pipeline lesson → one zip per language.
//
//   node scripts/export-scorm.mts pipeline/out/lesson-cs-01/v1 [--locale ar|en|both] [--out dist/scorm]
//
// Reads lesson.json + items.json from the folder, writes
// <out>/masar-<code>-<locale>-scorm12.zip with imsmanifest.xml at the root.
// Nothing is uploaded anywhere; the zip is for loading into an LMS by hand.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildScorm, zipStore, type ScormLocale } from '../lib/scorm.ts'

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
const opt = (name: string, dflt: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt
}
if (!dir) {
  console.error('usage: node scripts/export-scorm.mts <lesson folder> [--locale ar|en|both] [--out dist/scorm]')
  process.exit(2)
}
const which = opt('locale', 'both')
const out = opt('out', 'dist/scorm')
const locales: ScormLocale[] = which === 'both' ? ['ar', 'en'] : [which as ScormLocale]

const lesson = JSON.parse(readFileSync(join(dir, 'lesson.json'), 'utf-8'))
const items = JSON.parse(readFileSync(join(dir, 'items.json'), 'utf-8'))
const code = String(lesson.objectives?.[0] ?? lesson.slug).toLowerCase()
mkdirSync(out, { recursive: true })

for (const loc of locales) {
  if (loc === 'ar' && lesson.bilingual === false) {
    console.log(`skip ar: ${code} is English-only (bilingual: false)`)
    continue
  }
  const { files, skipped, checks } = buildScorm(lesson, items, loc)
  const path = join(out, `masar-${code}-${loc}-scorm12.zip`)
  const zip = zipStore(files)
  writeFileSync(path, zip)
  console.log(`wrote ${path} (${zip.length} bytes, ${checks} knowledge checks)`)
  if (skipped.length) console.log(`  not exported: ${skipped.join(', ')}`)
}
