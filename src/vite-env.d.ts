/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_USER_EMAIL?: string;
  readonly VITE_TEST_USER_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
