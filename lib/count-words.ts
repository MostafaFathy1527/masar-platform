/**
 * Small counts in words, for copy that used to say "three samples" as a fixed
 * phrase and stopped being true the day a fourth was added (failure entry 13's
 * pattern). Three to ten only; anything else is written as digits.
 *
 * Arabic numbers from three to ten take the opposite gender of the singular
 * noun: ثلاثة دروس (درس is masculine), ثلاث عينات (عينة is feminine). The caller
 * says which the singular is; the rule is applied here rather than in each page.
 */

const EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const AR_FOR_MASCULINE_NOUN = ['', '', '', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة']
const AR_FOR_FEMININE_NOUN = ['', '', '', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثماني', 'تسع', 'عشر']

export function countEn(n: number, capitalise = false): string {
  const w = n >= 0 && n <= 10 ? EN[n] : String(n)
  return capitalise ? w.charAt(0).toUpperCase() + w.slice(1) : w
}

export function countAr(n: number, singularIs: 'masculine' | 'feminine'): string {
  if (n < 3 || n > 10) return String(n)
  return (singularIs === 'masculine' ? AR_FOR_MASCULINE_NOUN : AR_FOR_FEMININE_NOUN)[n]
}

/**
 * A count with its Arabic noun in the right form. One is the noun alone with
 * واحد, two is the dual, three to ten take the plural, and eleven upward
 * returns to the singular accusative. Interpolating a bare numeral in front of
 * one fixed noun is wrong for every value but one, and both pages that did it
 * (the drafts count and the failures count) were wrong for the number they
 * actually showed.
 */
export function arCounted(
  n: number,
  forms: { one: string; two: string; plural: string; accusative: string },
): string {
  if (n === 1) return forms.one
  if (n === 2) return forms.two
  const tail = n % 100
  if (tail >= 3 && tail <= 10) return `${n} ${forms.plural}`
  return `${n} ${forms.accusative}`
}
