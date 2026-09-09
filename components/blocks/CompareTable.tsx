import { pick, type BlockProps } from '@/lib/content-locale'

type Payload = {
  captionAr: string; captionEn: string
  columns: string[]
  rows: string[][]
}

export function CompareTable({ payload, locale }: BlockProps<Payload>) {
  return (
    // Wide content scrolls inside its own container so the page body never
    // scrolls horizontally, in either direction.
    <div className="block-table-scroll">
      <table className="block-table">
        <caption>{pick(locale, payload.captionAr, payload.captionEn)}</caption>
        <thead>
          <tr>
            {payload.columns.map((c, i) => (
              <th key={i} scope="col">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payload.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c}>{cell}</td>,
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
