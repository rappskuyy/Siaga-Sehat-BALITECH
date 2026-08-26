-- =========================================================================
-- SiagaSehat — Supabase Full SQL Schema + Row Level Security (RLS) Rules
-- =========================================================================
-- Cara pakai:
-- 1. Buka Supabase Dashboard > SQL Editor.
-- 2. Paste seluruh isi file ini, lalu klik "Run".
-- 3. Salin Project URL & anon public key dari Project Settings > API ke
--    file .env sebagai VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.
-- =========================================================================

-- Pastikan ekstensi UUID tersedia (biasanya sudah default di Supabase)
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. TABLE: profiles
-- Menyimpan data profil kesehatan pengguna: nama, tinggi, berat, umur, dll.
-- id = auth.users.id (1:1 relationship)
-- =========================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  height_cm numeric(5, 1) check (height_cm is null or (height_cm > 0 and height_cm < 300)),
  weight_kg numeric(5, 1) check (weight_kg is null or (weight_kg > 0 and weight_kg < 500)),
  age smallint check (age is null or (age >= 0 and age < 150)),
  gender text check (gender is null or gender in ('laki-laki', 'perempuan')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil kesehatan pengguna SiagaSehat (1:1 dengan auth.users)';

-- =========================================================================
-- 2. TABLE: scan_history
-- Riwayat hasil pemeriksaan AI Scanner (analisis gambar kesehatan).
-- =========================================================================
create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nama_penyakit text not null,
  ringkasan text not null,
  tingkat_bahaya text not null check (tingkat_bahaya in ('rendah', 'sedang', 'tinggi')),
  tingkat_keyakinan text not null check (tingkat_keyakinan in ('rendah', 'sedang', 'tinggi')),
  harus_ke_dokter boolean not null default false,
  penyebab jsonb not null default '[]'::jsonb,
  pencegahan_mandiri jsonb not null default '[]'::jsonb,
  obat_rekomendasi jsonb not null default '[]'::jsonb,
  obat_herbal jsonb not null default '[]'::jsonb,
  catatan_tambahan text,
  image_preview text,
  created_at timestamptz not null default now()
);

comment on table public.scan_history is 'Riwayat hasil scan/analisis gambar kesehatan berbasis AI per pengguna';

create index if not exists scan_history_user_id_created_at_idx
  on public.scan_history (user_id, created_at desc);

-- =========================================================================
-- 3. TABLE: consultation_history
-- Riwayat sesi konsultasi AI (chat), termasuk bagian tubuh yang dipilih.
-- =========================================================================
create table if not exists public.consultation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  body_part text,
  pain_level text check (pain_level is null or pain_level in ('ringan', 'sedang', 'berat')),
  detail text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.consultation_history is 'Riwayat sesi konsultasi AI (chat + bagian tubuh yang dipilih) per pengguna';

create index if not exists consultation_history_user_id_created_at_idx
  on public.consultation_history (user_id, created_at desc);

-- =========================================================================
-- 4. TRIGGER: auto-create profile row saat user baru mendaftar
-- Mengambil full_name/height_cm/weight_kg/age dari raw_user_meta_data yang
-- dikirim saat supabase.auth.signUp({ options: { data: {...} } }).
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, height_cm, weight_kg, age)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    nullif(new.raw_user_meta_data ->> 'height_cm', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'weight_kg', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'age', '')::smallint
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- 5. TRIGGER: auto-update updated_at pada profiles
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =========================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- Aturan: setiap pengguna HANYA boleh membaca & mengubah datanya sendiri.
-- =========================================================================

-- ---- profiles ------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Tidak ada policy delete: profil tidak boleh dihapus manual oleh user
-- (akan otomatis terhapus lewat ON DELETE CASCADE saat akun dihapus).

-- ---- scan_history ---------------------------------------------------------
alter table public.scan_history enable row level security;

drop policy if exists "scan_history_select_own" on public.scan_history;
create policy "scan_history_select_own"
  on public.scan_history for select
  using (auth.uid() = user_id);

drop policy if exists "scan_history_insert_own" on public.scan_history;
create policy "scan_history_insert_own"
  on public.scan_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "scan_history_delete_own" on public.scan_history;
create policy "scan_history_delete_own"
  on public.scan_history for delete
  using (auth.uid() = user_id);

-- Riwayat scan bersifat append-only dari sisi aplikasi: tidak ada policy update.

-- ---- consultation_history ---------------------------------------------------
alter table public.consultation_history enable row level security;

drop policy if exists "consultation_history_select_own" on public.consultation_history;
create policy "consultation_history_select_own"
  on public.consultation_history for select
  using (auth.uid() = user_id);

drop policy if exists "consultation_history_insert_own" on public.consultation_history;
create policy "consultation_history_insert_own"
  on public.consultation_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "consultation_history_delete_own" on public.consultation_history;
create policy "consultation_history_delete_own"
  on public.consultation_history for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- 7. (Opsional) Trigger user_id otomatis dari auth.uid() saat insert
-- Berguna sebagai lapisan pengaman tambahan bila kolom user_id lupa diisi
-- dari sisi client. Tidak wajib karena policy insert sudah mewajibkan
-- auth.uid() = user_id, tapi ini mencegah error jika user_id NULL.
-- =========================================================================
create or replace function public.set_user_id_from_auth()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_scan_history_user_id on public.scan_history;
create trigger set_scan_history_user_id
  before insert on public.scan_history
  for each row execute procedure public.set_user_id_from_auth();

drop trigger if exists set_consultation_history_user_id on public.consultation_history;
create trigger set_consultation_history_user_id
  before insert on public.consultation_history
  for each row execute procedure public.set_user_id_from_auth();

-- =========================================================================
-- SELESAI
-- Ringkasan tabel:
--   public.profiles              -> data profil kesehatan (1:1 dengan auth.users)
--   public.scan_history          -> riwayat hasil AI Scanner
--   public.consultation_history  -> riwayat sesi konsultasi AI (chat)
-- Semua tabel diproteksi RLS: user hanya bisa akses baris miliknya sendiri.
-- =========================================================================
