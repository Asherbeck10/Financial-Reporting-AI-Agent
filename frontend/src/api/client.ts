import axios from "axios"
import { auth } from "../lib/firebase"

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

client.interceptors.request.use(async (config) => {
  if (import.meta.env.VITE_E2E_AUTH !== "1") {
    const token = await auth.currentUser?.getIdToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
