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

export type PurchaseLocation = "apotek" | "rs";
export type ReminderSourceType = "scan" | "consultation";

export interface MedicineReminder {
  id: string;
  user_id: string;
  source_type: ReminderSourceType;
  source_id: string | null;
  purchase_location: PurchaseLocation;
  nama_obat: string;
  dosis_per_minum: string;
  jumlah_tablet: number;
  interval_jam: number;
  waktu_mulai: string;
  waktu_berakhir: string | null;
  is_active: boolean;
  tablet_tersisa: number | null;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export type MedicineReminderInsert = Omit<
  MedicineReminder,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export interface ReminderLog {
  id: string;
  reminder_id: string;
  user_id: string;
  taken_at: string;
  skipped: boolean;
  catatan: string | null;
  created_at: string;
}

export type ReminderLogInsert = Omit<ReminderLog, "id" | "user_id" | "created_at">;
