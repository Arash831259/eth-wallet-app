/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional custom Sepolia JSON-RPC URL. Falls back to the public default. */
  readonly VITE_SEPOLIA_RPC_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
