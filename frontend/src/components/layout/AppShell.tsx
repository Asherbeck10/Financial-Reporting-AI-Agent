import { Outlet, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function AppShell() {
  const { pathname } = useLocation()
  const showSidebar = pathname !== "/"

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {showSidebar && <Sidebar />}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
