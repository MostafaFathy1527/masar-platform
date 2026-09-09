import type { AppLocale } from '@/i18n/routing'
import type { Block } from '@/lib/schema/lesson'
import { CompareTable } from './CompareTable'
import { DefinitionCard } from './DefinitionCard'
import { Heading } from './Heading'
import { JobTip } from './JobTip'
import { KnowledgeCheck } from './KnowledgeCheck'
import { PracticeSim } from './PracticeSim'
import { ProcessFlow } from './ProcessFlow'
import { RichText } from './RichText'
import { Scenario } from './Scenario'
import { SortBuckets } from './SortBuckets'
import { Takeaways } from './Takeaways'
import { WorkedExample } from './WorkedExample'

/**
 * The block registry.
 *
 * The switch is exhaustive over the discriminated union, and the `never` in the
 * default branch is what enforces that: add a thirteenth block type to the Zod
 * schema without adding a case here and this stops compiling. That is the whole
 * reason the switch is written out rather than driven by a lookup table — a
 * map keyed by string would accept a missing entry silently and render nothing.
 */
export function BlockRenderer({ block, locale }: { block: Block; locale: AppLocale }) {
  const common = { locale, blockId: block.id }

  switch (block.type) {
    case 'heading':
      return <Heading payload={block.payload} {...common} />
    case 'rich_text':
      return <RichText payload={block.payload} {...common} />
    case 'definition_card':
      return <DefinitionCard payload={block.payload} {...common} />
    case 'compare_table':
      return <CompareTable payload={block.payload} {...common} />
    case 'process_flow':
      return <ProcessFlow payload={block.payload} {...common} />
    case 'job_tip':
      return <JobTip payload={block.payload} {...common} />
    case 'takeaways':
      return <Takeaways payload={block.payload} {...common} />
    case 'worked_example':
      return <WorkedExample payload={block.payload} {...common} />
    case 'knowledge_check':
      return <KnowledgeCheck payload={block.payload} {...common} />
    case 'scenario':
      return <Scenario payload={block.payload} {...common} />
    case 'sort_buckets':
      return <SortBuckets payload={block.payload} {...common} />
    case 'practice_sim':
      return <PracticeSim payload={block.payload} {...common} />
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

/** Renders one level's block array. Every block carries a stable id, which is
 *  what BlockInteraction rows will key on for block-level analytics. */
export function BlockList({ blocks, locale }: { blocks: Block[]; locale: AppLocale }) {
  return (
    <div className="block-list">
      {blocks.map((block) => (
        <div key={block.id} data-block-id={block.id} data-block-type={block.type}>
          <BlockRenderer block={block} locale={locale} />
        </div>
      ))}
    </div>
  )
}
