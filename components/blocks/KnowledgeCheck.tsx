import { type BlockProps } from '@/lib/content-locale'

type Payload = { itemRef: string }

/**
 * An in-lesson knowledge check. Never scored, never in the gradebook.
 *
 * Week 2 renders the reference only: items live in their own table and the
 * assessment engine lands in Week 4. This is a visible placeholder rather than
 * a silent gap, so an unfinished lesson looks unfinished instead of looking
 * like a block that failed to render.
 */
export function KnowledgeCheck({ payload, locale }: BlockProps<Payload>) {
  return (
    <div className="block-placeholder" data-item-ref={payload.itemRef}>
      <span className="block-placeholder-label">
        {locale === 'ar' ? 'سؤال تفاعلي' : 'Knowledge check'}
      </span>
      <p>
        {locale === 'ar'
          ? 'يُعرض هذا السؤال عند تشغيل بنك الأسئلة (الأسبوع الرابع).'
          : 'This check renders once the item bank ships (Week 4).'}
      </p>
      <code>{payload.itemRef}</code>
    </div>
  )
}
