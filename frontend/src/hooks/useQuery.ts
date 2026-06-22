import { useState, useEffect } from "react"
import { submitQuery, listQueries } from "../api/queries"
import type { QueryResponse } from "../types"

export function useQuery(datasetId: string) {
  const [messages, setMessages] = useState<QueryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!datasetId) return
    listQueries(datasetId)
      .then(setMessages)
      .catch(() => setMessages([]))
  }, [datasetId])

  async function ask(question: string) {
    setLoading(true)
    setError(null)
    const optimistic: QueryResponse = {
      query_id: crypto.randomUUID(),
      dataset_id: datasetId,
      question,
      answer_text: "",
      chart_type: null,
      chart_title: null,
      chart_data: null,
      chart_config: null,
      summary_stats: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      const response = await submitQuery(datasetId, question)
      setMessages((prev) =>
        prev.map((m) =>
          m.query_id === optimistic.query_id ? response : m
        )
      )
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Query failed. Please try again."
      setError(msg)
      setMessages((prev) =>
        prev.filter((m) => m.query_id !== optimistic.query_id)
      )
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, error, ask }
}
