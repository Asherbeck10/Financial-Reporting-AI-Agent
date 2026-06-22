import { useEffect, useRef } from "react"
import type { QueryResponse } from "../../types"
import { ChatMessage } from "./ChatMessage"

interface Props {
  messages: QueryResponse[]
  loading: boolean
}

export function ChatHistory({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length, loading])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-16">
        <p className="text-sm font-medium text-[#64748B]">No questions yet</p>
        <p className="text-xs text-[#94A3B8]">
          Ask anything about your data below.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-1">
      {messages.map((m) => (
        <ChatMessage key={m.query_id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
