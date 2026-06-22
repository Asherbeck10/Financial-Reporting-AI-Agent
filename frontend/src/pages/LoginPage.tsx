import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export function LoginPage() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) navigate("/", { replace: true })
  }, [user, navigate])

  const handleSignIn = async () => {
    setPending(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch {
      setError("Sign-in failed. Please try again.")
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl tracking-tight text-[#0F172A]">
            FinReport AI
          </span>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your financial reports
          </p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={pending}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#0F172A] transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {pending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {pending ? "Signing in…" : "Continue with Google"}
        </button>

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  )
}
