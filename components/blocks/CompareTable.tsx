import { pick, type BlockProps } from '@/lib/content-locale'

type Cell = { textAr: string; textEn: string }
type Payload = {
  captionAr: string; captionEn: string
  columns: Array<{ labelAr: string; labelEn: string }>
  rows: Cell[][]
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
              <th key={i} scope="col">{pick(locale, c.labelAr, c.labelEn)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {payload.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const text = pick(locale, cell.textAr, cell.textEn)
                // The first cell of each row labels it, so it is a header for
                // that row rather than data — screen readers announce it when
                // reading any cell in the row.
                return c === 0 ? (
                  <th key={c} scope="row">{text}</th>
                ) : (
                  <td key={c}>{text}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
