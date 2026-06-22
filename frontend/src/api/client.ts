import axios from "axios"
import { auth } from "../lib/firebase"

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

client.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default client
