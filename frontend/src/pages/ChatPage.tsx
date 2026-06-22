import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getDataset } from "../api/datasets"
import { useQuery } from "../hooks/useQuery"
import type { DatasetSummary } from "../types"
import { DataTable } from "../components/data/DataTable"
import { ChatHistory } from "../components/chat/ChatHistory"
import { ChatInput } from "../components/chat/ChatInput"

export function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const datasetId = id ?? ""
  const [dataset, setDataset] = useState<DatasetSummary | null>(null)
  const { messages, loading, error, ask } = useQuery(datasetId)

  useEffect(() => {
    if (datasetId) {
      getDataset(datasetId).then(setDataset).catch(console.error)
    }
  }, [datasetId])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F7F8FA]">
      <header className="flex items-center gap-3 border-b border-[#E2E8F0] bg-white px-6 py-3 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[#0F172A] truncate max-w-xs">
            {dataset?.name ?? "Loading…"}
          </h2>
          {dataset && (
            <p className="text-xs text-[#64748B] font-data">
              {dataset.row_count.toLocaleString()} rows &nbsp;·&nbsp; {dataset.columns.length} columns
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {dataset && (
            <div className="border-b border-[#E2E8F0] bg-white px-6 py-4 flex-shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-3">
                Data Preview
              </p>
              <div className="max-h-52 overflow-y-auto">
                <DataTable datasetId={datasetId} columns={dataset.columns} />
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col overflow-hidden px-6 py-4 gap-4">
            <div className="flex-1 overflow-y-auto">
              <ChatHistory messages={messages} loading={loading} />
            </div>

            {error && (
              <p className="text-xs text-down bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <ChatInput onSubmit={ask} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
