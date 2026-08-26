export interface Profile {
  id: string;
  full_name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  gender: "laki-laki" | "perempuan" | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Pick<Profile, "full_name" | "height_cm" | "weight_kg" | "age" | "gender" | "avatar_url">
>;

export interface ScanHistoryRow {
  id: string;
  user_id: string;
  nama_penyakit: string;
  ringkasan: string;
  tingkat_bahaya: "rendah" | "sedang" | "tinggi";
  tingkat_keyakinan: "rendah" | "sedang" | "tinggi";
  harus_ke_dokter: boolean;
  penyebab: string[];
  pencegahan_mandiri: string[];
  obat_rekomendasi: Array<{ nama: string; dosis: string; catatan: string }>;
  obat_herbal: Array<{ nama: string; cara_pakai: string }>;
  catatan_tambahan: string | null;
  image_preview: string | null;
  created_at: string;
}

export type ScanHistoryInsert = Omit<ScanHistoryRow, "id" | "user_id" | "created_at">;

export interface ConsultationHistoryRow {
  id: string;
  user_id: string;
  body_part: string | null;
  pain_level: "ringan" | "sedang" | "berat" | null;
  detail: string | null;
  messages: Array<{ role: "user" | "assistant"; text: string }>;
  created_at: string;
}

export type ConsultationHistoryInsert = Omit<
  ConsultationHistoryRow,
  "id" | "user_id" | "created_at"
>;
