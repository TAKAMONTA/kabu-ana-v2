
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_REVENUECAT_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
