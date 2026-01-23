/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHANNEL_TALK_PLUGIN_KEY: string;
  readonly VITE_USE_NOTION: string;
  readonly VITE_API_URL: string;
  readonly VITE_META_DASH_URL: string;
  readonly VITE_CAMPAIGN_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
