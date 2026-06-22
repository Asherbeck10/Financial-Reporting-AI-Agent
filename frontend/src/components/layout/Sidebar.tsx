import { Link, useParams } from "react-router-dom"
import { useDatasets } from "../../hooks/useDatasets"
import { useAuth } from "../../context/AuthContext"

export function Sidebar() {
  const datasets = useDatasets()
  const { id } = useParams<{ id: string }>()
  const { user, signOut } = useAuth()

  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar text-slate-400 flex-shrink-0">
      <div className="px-5 py-5 border-b border-slate-700/50">
        <span className="font-display text-white text-lg tracking-tight">
          FinReport AI
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        <p className="px-3 py-1 text-xs uppercase tracking-widest text-slate-500 font-semibold">
          Datasets
        </p>
        {datasets.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-500">No datasets yet.</p>
        )}
        {datasets.map((ds) => {
          const active = ds.id === id
          return (
            <Link
              key={ds.id}
              to={`/chat/${ds.id}`}
              className={[
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800/60 hover:text-slate-200",
              ].join(" ")}
            >
              <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${active ? "bg-accent" : "bg-slate-600"}`} />
              <span className="truncate">{ds.name}</span>
              <span className="ml-auto text-xs text-slate-500 font-data flex-shrink-0">
                {ds.row_count.toLocaleString()}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="px-2 py-3 border-t border-slate-700/50 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Upload New
        </Link>

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Sign out
        </button>

        <div className="flex items-center gap-2 px-3 py-2">
          {user?.photoURL ? (
            <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="h-6 w-6 rounded-full flex-shrink-0" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-slate-300">
              {user?.displayName?.[0] ?? "?"}
            </div>
          )}
          <span className="truncate text-xs text-slate-500">
            {user?.displayName ?? user?.email}
          </span>
        </div>
      </div>
    </aside>
  )
}
