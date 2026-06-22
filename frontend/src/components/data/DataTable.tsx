import { useEffect, useState } from "react"
import { getRows } from "../../api/datasets"
import type { DataTableResponse } from "../../types"

interface Props {
  datasetId: string
  columns: { name: string }[]
}

export function DataTable({ datasetId, columns }: Props) {
  const [data, setData] = useState<DataTableResponse | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const PAGE_SIZE = 50

  useEffect(() => {
    setLoading(true)
    getRows(datasetId, page, PAGE_SIZE)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [datasetId, page])

  if (!data && loading) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-[#64748B]">
        Loading data…
      </div>
    )
  }
  if (!data) return null

  const headers = columns.length ? columns.map((c) => c.name) : Object.keys(data.rows[0] ?? {})
  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div data-testid="data-table" className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              {headers.map((h) => (
                <th
                  key={h}
                  role="columnheader"
                  className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-[#64748B] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
              >
                {headers.map((h) => (
                  <td
                    key={h}
                    className="px-4 py-2 font-data text-xs text-[#0F172A] whitespace-nowrap"
                  >
                    {row[h] == null ? (
                      <span className="text-[#94A3B8]">—</span>
                    ) : (
                      String(row[h])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1 text-sm text-[#64748B]">
          <span className="font-data text-xs">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)} of {data.total.toLocaleString()} rows
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded px-3 py-1 text-xs font-medium border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="rounded px-3 py-1 text-xs font-medium border border-[#E2E8F0] hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
