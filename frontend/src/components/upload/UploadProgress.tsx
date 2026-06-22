interface Props {
  progress: number
  status: "uploading" | "done" | "error"
  error?: string | null
  filename: string
}

export function UploadProgress({ progress, status, error, filename }: Props) {
  return (
    <div data-testid="upload-progress" className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate max-w-xs text-[#0F172A]">
          {filename}
        </span>
        <span className="text-[#64748B] font-data">
          {status === "done" ? "100%" : status === "error" ? "failed" : `${progress}%`}
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={[
            "h-full rounded-full transition-all duration-300",
            status === "error" ? "bg-down" : "bg-accent",
          ].join(" ")}
          style={{ width: `${status === "done" ? 100 : progress}%` }}
        />
      </div>

      {status === "error" && error && (
        <p className="text-sm text-down">{error}</p>
      )}
      {status === "done" && (
        <p className="text-sm text-up font-medium">Upload complete — redirecting…</p>
      )}
    </div>
  )
}
