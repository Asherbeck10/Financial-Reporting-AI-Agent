import { useState } from "react"
import { uploadFile } from "../api/uploads"
import type { UploadResponse } from "../types"

type Status = "idle" | "uploading" | "done" | "error"

export function useUpload() {
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File): Promise<UploadResponse | null> {
    setStatus("uploading")
    setProgress(0)
    setError(null)
    try {
      const data = await uploadFile(file, setProgress)
      setResult(data)
      setStatus("done")
      return data
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Upload failed. Please try again."
      setError(msg)
      setStatus("error")
      return null
    }
  }

  function reset() {
    setStatus("idle")
    setProgress(0)
    setResult(null)
    setError(null)
  }

  return { upload, reset, status, progress, result, error }
}
