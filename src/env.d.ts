/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WEB_HOSTNAME: string
  readonly PUBLIC_DEBUG: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
