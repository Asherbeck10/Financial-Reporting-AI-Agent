import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"]

function getExtension(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase()
}

export function UploadDropzone({ onFile, disabled }: Props) {
  const [extError, setExtError] = useState(false)

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files[0]
      if (!file) return
      const ext = getExtension(file.name)
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setExtError(true)
        return
      }
      setExtError(false)
      onFile(file)
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      disabled,
      // Accept all files — we validate by extension in onDrop
      // macOS assigns unpredictable MIME types to xlsx/xls files
    })

  const rejected = fileRejections.length > 0 || extError

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        data-testid="upload-dropzone"
        className={[
          "relative flex flex-col items-center justify-center gap-4",
          "rounded-2xl border-2 border-dashed px-8 py-16 transition-colors cursor-pointer",
          isDragActive
            ? "border-accent bg-indigo-50"
            : "border-indigo-200 hover:border-accent hover:bg-indigo-50/50",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        <svg
          className={`h-12 w-12 ${isDragActive ? "text-accent" : "text-indigo-300"} transition-colors`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <div className="text-center">
          <p className="text-base font-medium text-[#0F172A]">
            {isDragActive ? "Drop it here" : "Drop CSV or Excel here"}
          </p>
          <p className="mt-1 text-sm text-[#64748B]">or click to browse</p>
        </div>
      </div>

      {rejected && (
        <p
          data-testid="upload-error"
          className="mt-3 text-sm text-down font-medium"
        >
          Only CSV and Excel files are accepted (.csv, .xls, .xlsx). Please try again.
        </p>
      )}

      <p className="mt-3 text-xs text-[#64748B] text-center">
        Supported: .csv &nbsp;·&nbsp; .xlsx &nbsp;·&nbsp; .xls &nbsp;·&nbsp; max 20 MB
      </p>
    </div>
  )
}
