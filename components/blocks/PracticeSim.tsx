import { type BlockProps } from '@/lib/content-locale'

type Payload = { simSlug: string }

/**
 * The L3 applied practice.
 *
 * This rendered a placeholder reading "The simulation ships in Week 3" — long
 * after it shipped in Week 3 and went live at /practice/claim-review. The
 * deepest level of the flagship lesson, the thing the entire depth model builds
 * toward, was a coming-soon box pointing at work that was already finished and
 * reachable two clicks away.
 *
 * It links rather than embeds, deliberately. The workbench reads its dataset
 * from the database; embedding it here would make the lesson reader fail
 * whenever the database is unreachable, which is the exact property the reader
 * was built to avoid. A reader, not a player.
 */
export function PracticeSim({ payload, locale }: BlockProps<Payload>) {
  const ar = locale === 'ar'
  return (
    <div className="practice-cta" data-sim-slug={payload.simSlug}>
      <span className="practice-cta-label">
        {ar ? 'تدريب تطبيقي — المستوى الثالث' : 'Applied practice — L3'}
      </span>
      <p className="practice-cta-lead">
        {ar
          ? 'تنتقل الآن من القراءة إلى الإنتاج: تراجع مطالبة حقيقية الشكل وتعلّم كل حقل تراه سيمنع سدادها.'
          : 'This is where reading turns into producing work: review a realistic claim and flag every field you think would stop it being paid.'}
      </p>
      <p className="practice-cta-note">
        {ar
          ? 'الدرجة بمقياس F1، فتعليم كل الحقول يخفض النتيجة بدل أن يرفعها. وكل خطأ فائت يعود برابط إلى الكتلة التي شرحته.'
          : 'Scored with F1, so flagging everything lowers the score rather than raising it. Every miss links back to the block that taught it.'}
      </p>
      <a className="btn-primary" href={`/${locale}/practice/${payload.simSlug}`}>
        {ar ? 'ابدأ التدريب' : 'Start the practice'}
      </a>
    </div>
  )
}
