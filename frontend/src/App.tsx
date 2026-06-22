import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "./components/layout/AppShell"
import { UploadPage } from "./pages/UploadPage"
import { ChatPage } from "./pages/ChatPage"
import { NotFoundPage } from "./pages/NotFoundPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<UploadPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
