/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    supabase: import('./lib/supabase').Supabase;
    user: import('@supabase/supabase-js').User | null;
    /** Set on /portal pages only. */
    profile: {
      id: string;
      full_name: string | null;
      class_year: number | null;
      role: 'member' | 'president';
    };
  }
}
