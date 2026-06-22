import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <p className="font-display text-6xl font-bold text-[#E2E8F0]">404</p>
      <p className="text-sm text-[#64748B]">Page not found.</p>
      <Link to="/" className="text-sm text-accent hover:underline">
        Go home
      </Link>
    </div>
  )
}
