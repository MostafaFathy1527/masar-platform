import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { arCounted } from '@/lib/count-words'
import { DRAFT_DIR, distinctLessons, draftIndex, draftRubric, endToEndRuns } from '@/lib/drafts'
import { lessonIndex } from '@/lib/lessons'
import { publicPaths, SITE_URL, sitemapEntries } from '@/lib/seo'

describe('distinctLessons', () => {
  it('counts lessons, not folders: calibration is not a lesson and a retry is not a second one', () => {
    expect(
      distinctLessons([
        'calibration',
        'lesson-02',
        'lesson-cs-01',
        'lesson-ops-01',
        'lesson-ops-01-r2',
        'lesson-prv-01',
        'lesson-sec-01',
      ]),
    ).toEqual(['lesson-02', 'lesson-cs-01', 'lesson-ops-01', 'lesson-prv-01', 'lesson-sec-01'])
  })

  it('folds any numbered retry, and leaves a lesson whose code merely ends in r', () => {
    expect(distinctLessons(['lesson-a-01-r3', 'lesson-a-01-r10', 'lesson-hr-01'])).toEqual([
      'lesson-a-01',
      'lesson-hr-01',
    ])
  })

  it('never counts more lessons than there are lesson folders', () => {
    const dirs = readdirSync(DRAFT_DIR)
    expect(distinctLessons(dirs).length).toBeLessThanOrEqual(dirs.filter((d) => d.startsWith('lesson-')).length)
  })
})

describe('arCounted', () => {
  const forms = { one: 'درس واحد', two: 'درسان', plural: 'دروس', accusative: 'درسًا' }
  it('takes the right noun form for each range', () => {
    expect(arCounted(1, forms)).toBe('درس واحد')
    expect(arCounted(2, forms)).toBe('درسان')
    expect(arCounted(5, forms)).toBe('5 دروس')
    expect(arCounted(19, forms)).toBe('19 درسًا')
    expect(arCounted(638, forms)).toBe('638 درسًا')
    expect(arCounted(105, forms)).toBe('105 دروس')
  })
})

describe('end-to-end runs', () => {
  it('reads one objective per folder that holds a run.json', () => {
    const runs = endToEndRuns()
    const withRun = readdirSync(DRAFT_DIR).filter((d) => {
      try {
        readFileSync(`${DRAFT_DIR}/${d}/run.json`)
        return true
      } catch {
        return false
      }
    })
    expect(runs.length).toBe(withRun.length)
  })
})

describe('commission samples', () => {
  const src = readFileSync('app/[locale]/commission/page.tsx', 'utf-8')

  it('builds the table from the same list the heading counts', () => {
    expect(src).not.toMatch(/const SAMPLES\s*=/)
    expect(src).toMatch(/samples\.map\(/)
  })

  it('names which samples the panel split on, from the panel reports', () => {
    const split = draftIndex()
      .filter((d) => draftRubric(d.dir)?.panel === 'NEEDS HUMAN')
      .map((d) => d.code)
    // The sentence is built from splitCodes, so it can only name these.
    expect(src).toMatch(/splitCodes/)
    for (const code of split) expect(draftIndex().some((d) => d.code === code)).toBe(true)
  })
})

describe('sitemap', () => {
  const lessons = lessonIndex().map((l) => l.slug)
  const samples = draftIndex().map((d) => d.code)
  const paths = publicPaths(lessons, samples)
  const entries = sitemapEntries(paths)

  it('lists every public page in both locales', () => {
    expect(entries.length).toBe(paths.length * 2)
    for (const p of ['', '/course', '/samples', '/depth', '/how-it-was-built', '/case-study', '/commission', '/privacy']) {
      expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/ar${p}`)
      expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/en${p}`)
    }
  })

  it('lists each lesson and each sample', () => {
    expect(lessons.length).toBeGreaterThan(0)
    expect(samples.length).toBeGreaterThan(0)
    for (const s of lessons) expect(paths).toContain(`/lesson/${s}`)
    for (const c of samples) expect(paths).toContain(`/samples/${c}`)
  })

  it('gives every entry its other-language twin', () => {
    for (const e of entries) {
      expect(Object.keys(e.alternates.languages).sort()).toEqual(['ar', 'en'])
    }
  })

  it('lists no private page', () => {
    for (const e of entries) expect(e.url).not.toMatch(/\/(admin|checkout|assess|practice|certificate|verify)\b/)
  })
})

describe('proxy matcher', () => {
  it('leaves robots.txt and sitemap.xml alone', () => {
    const src = readFileSync('proxy.ts', 'utf-8')
    const pattern = /matcher:\s*'([^']+)'/.exec(src)?.[1]
    expect(pattern).toBeTruthy()
    // The file holds the string literal, so '\\.' in the source is '\.' in the pattern.
    const re = new RegExp(`^${pattern!.split('\\\\').join('\\')}$`)
    expect(re.test('/robots.txt')).toBe(false)
    expect(re.test('/sitemap.xml')).toBe(false)
    expect(re.test('/en/course')).toBe(true)
  })
})
