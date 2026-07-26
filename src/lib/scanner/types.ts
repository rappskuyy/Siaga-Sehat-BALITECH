export type DangerLevel = "rendah" | "sedang" | "tinggi";

export interface ScanMedicine {
  nama: string;
  dosis: string;
  catatan: string;
}

export interface ScanHerbal {
  nama: string;
  cara_pakai: string;
}

export interface ScanResult {
  gambar_dapat_dianalisis: boolean;
  nama_penyakit: string;
  ringkasan: string;
  tingkat_bahaya: DangerLevel;
  penyebab: string[];
  pencegahan_mandiri: string[];
  harus_ke_dokter: boolean;
  alasan_ke_dokter: string;
  obat_rekomendasi: ScanMedicine[];
  obat_herbal: ScanHerbal[];
  catatan_tambahan: string;
  tingkat_keyakinan: DangerLevel;
}

export const SCAN_RESULT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "gambar_dapat_dianalisis",
    "nama_penyakit",
    "ringkasan",
    "tingkat_bahaya",
    "penyebab",
    "pencegahan_mandiri",
    "harus_ke_dokter",
    "alasan_ke_dokter",
    "obat_rekomendasi",
    "obat_herbal",
    "catatan_tambahan",
    "tingkat_keyakinan",
  ],
  properties: {
    gambar_dapat_dianalisis: {
      type: "boolean",
      description:
        "false jika gambar tidak menunjukkan kondisi kesehatan/kulit yang bisa dianalisis",
    },
    nama_penyakit: { type: "string" },
    ringkasan: {
      type: "string",
      description: "Penjelasan singkat tentang kondisi yang terlihat pada gambar",
    },
    tingkat_bahaya: { type: "string", enum: ["rendah", "sedang", "tinggi"] },
    penyebab: { type: "array", items: { type: "string" } },
    pencegahan_mandiri: { type: "array", items: { type: "string" } },
    harus_ke_dokter: {
      type: "boolean",
      description: "true jika kondisi berpotensi serius dan butuh penanganan dokter segera",
    },
    alasan_ke_dokter: { type: "string" },
    obat_rekomendasi: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["nama", "dosis", "catatan"],
        properties: {
          nama: { type: "string" },
          dosis: { type: "string" },
          catatan: { type: "string" },
        },
      },
    },
    obat_herbal: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["nama", "cara_pakai"],
        properties: {
          nama: { type: "string" },
          cara_pakai: { type: "string" },
        },
      },
    },
    catatan_tambahan: { type: "string" },
    tingkat_keyakinan: { type: "string", enum: ["rendah", "sedang", "tinggi"] },
  },
} as const;
