import type { QueryResponse } from "../../types"
import { Chart } from "../charts/Chart"

interface Props {
  message: QueryResponse
}

export function ChatMessage({ message }: Props) {
  const isLoading = !message.answer_text

  return (
    <div
      data-testid="chat-message"
      className="animate-fade-up space-y-4"
    >
      <div className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">
        {message.question}
      </div>

      {isLoading ? (
        <div className="border-l-[3px] border-accent pl-4">
          <div className="flex gap-1.5 items-center py-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="border-l-[3px] border-accent pl-4 bg-white rounded-r-xl shadow-sm py-4 pr-4 space-y-4">
          <p
            data-testid="answer-text"
            className="text-sm leading-relaxed text-[#0F172A]"
          >
            {message.answer_text}
          </p>

          {message.chart_type && message.chart_data && (
            <div data-testid="chart-container">
              <Chart
                type={message.chart_type}
                title={message.chart_title ?? ""}
                data={message.chart_data}
                config={message.chart_config ?? {}}
              />
            </div>
          )}

          {message.summary_stats && Object.keys(message.summary_stats).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(message.summary_stats).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 text-xs"
                >
                  <span className="text-[#64748B]">{k}</span>
                  <span className="font-data font-medium text-[#0F172A]">
                    {typeof v === "number" ? v.toLocaleString() : String(v)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
