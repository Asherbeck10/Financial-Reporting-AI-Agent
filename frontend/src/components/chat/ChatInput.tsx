import { useState, useRef, KeyboardEvent } from "react"

interface Props {
  onSubmit: (question: string) => void
  loading: boolean
}

export function ChatInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const q = value.trim()
    if (!q || loading) return
    onSubmit(q)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function onInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="flex items-end gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-accent transition">
      <textarea
        ref={textareaRef}
        data-testid="chat-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onInput={onInput}
        rows={1}
        disabled={loading}
        placeholder="Ask a question about this data…"
        className="flex-1 resize-none bg-transparent text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none leading-5 max-h-40 overflow-y-auto disabled:opacity-60"
      />
      <button
        data-testid="chat-submit"
        onClick={submit}
        disabled={!value.trim() || loading}
        aria-label="Send question"
        className="flex-shrink-0 rounded-lg bg-accent px-3 py-1.5 text-white text-sm font-medium hover:bg-indigo-600 disabled:opacity-40 transition-colors"
      >
        {loading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.89H10.5a.75.75 0 010 1.5H4.182l-1.903 6.89a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
          </svg>
        )}
      </button>
    </div>
  )
}
