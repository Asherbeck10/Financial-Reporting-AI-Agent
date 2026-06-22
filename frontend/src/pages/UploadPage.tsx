import { useNavigate } from "react-router-dom"
import { useUpload } from "../hooks/useUpload"
import { useAppStore } from "../store/appStore"
import { UploadDropzone } from "../components/upload/UploadDropzone"
import { UploadProgress } from "../components/upload/UploadProgress"
import { getDataset } from "../api/datasets"
import { useAuth } from "../context/AuthContext"

export function UploadPage() {
  const navigate = useNavigate()
  const { upload, reset, status, progress, error } = useUpload()
  const addDataset = useAppStore((s) => s.addDataset)
  const { user, signOut } = useAuth()

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
    <div className="relative flex h-screen w-full flex-col items-center justify-center px-6">
      <div className="absolute top-4 right-5 flex items-center gap-2">
        {user?.photoURL ? (
          <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
            {user?.displayName?.[0] ?? "?"}
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>
      </div>
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
