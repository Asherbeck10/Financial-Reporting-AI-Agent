import { useNavigate } from "react-router-dom"
import { useUpload } from "../hooks/useUpload"
import { useAppStore } from "../store/appStore"
import { UploadDropzone } from "../components/upload/UploadDropzone"
import { UploadProgress } from "../components/upload/UploadProgress"
import { getDataset } from "../api/datasets"

export function UploadPage() {
  const navigate = useNavigate()
  const { upload, reset, status, progress, error } = useUpload()
  const addDataset = useAppStore((s) => s.addDataset)

  async function handleFile(file: File) {
    const result = await upload(file)
    if (result) {
      try {
        const dataset = await getDataset(result.dataset_id)
        addDataset(dataset)
        navigate(`/chat/${result.dataset_id}`)
      } catch {
        // dataset fetch failed after successful upload — navigate anyway
        navigate(`/chat/${result.dataset_id}`)
      }
    }
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <span className="font-display text-2xl font-bold text-[#0F172A] tracking-tight">
              FinReport AI
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-[#0F172A] leading-tight">
            Upload your<br />financial data.
          </h1>
          <p className="text-base text-[#64748B]">
            Ask plain-English questions. Get answers with charts.
          </p>
        </div>

        {status === "uploading" || status === "done" ? (
          <UploadProgress
            progress={progress}
            status={status}
            error={null}
            filename="Processing…"
          />
        ) : (
          <>
            <UploadDropzone onFile={handleFile} />
            {status === "error" && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-down">
                <span className="font-medium">Upload failed: </span>{error}
                <button
                  onClick={reset}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
