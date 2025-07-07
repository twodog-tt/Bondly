/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WAGMI_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 