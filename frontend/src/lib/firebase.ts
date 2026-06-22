import { initializeApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

// In E2E test mode Firebase is bypassed entirely — no SDK initialization.
const IS_E2E = import.meta.env.VITE_E2E_AUTH === "1"

let auth: Auth

if (!IS_E2E) {
  const app = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  })
  auth = getAuth(app)
} else {
  auth = {} as Auth
}

export { auth }
