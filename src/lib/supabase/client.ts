import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Tidak melempar error saat build/SSR, hanya peringatan di console.
  // Pastikan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY sudah diisi di .env

  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diset. Fitur login, register, profil, dan riwayat scan tidak akan berfungsi.",
  );
}

/**
 * Supabase client untuk digunakan di sisi browser (client components).
 * Session disimpan otomatis (localStorage) dan token di-refresh otomatis.
 * Semua query menghormati Row Level Security (RLS) yang didefinisikan di database.
 */
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
