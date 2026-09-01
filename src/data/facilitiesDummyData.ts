// Dummy data for facilities - photos and descriptions
// Random selection for realistic presentation

export const FACILITY_PHOTOS_ARRAY = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/RSUD_Dr._Soetomo_Surabaya.jpg/800px-RSUD_Dr._Soetomo_Surabaya.jpg", // RSUD Soetomo (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/RSUP_Dr._Sardjito.jpg/800px-RSUP_Dr._Sardjito.jpg", // RSUP Sardjito (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gedung_RSCM_Kencana.jpg/800px-Gedung_RSCM_Kencana.jpg", // RSCM Kencana (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Puskesmas_Pecangaan.jpg/800px-Puskesmas_Pecangaan.jpg", // Puskesmas Klinik (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Puskesmas_Kecamatan_Menteng.jpg/800px-Puskesmas_Kecamatan_Menteng.jpg", // Puskesmas Menteng (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Apotek_K-24_Tlogosari.jpg/800px-Apotek_K-24_Tlogosari.jpg", // Apotek K-24 (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Apotek_Kimia_Farma_Indonesia.jpg/800px-Apotek_Kimia_Farma_Indonesia.jpg", // Apotek Kimia Farma (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rumah_Sakit_General_Hospital_Indonesia.jpg/800px-Rumah_Sakit_General_Hospital_Indonesia.jpg", // RS General Hospital (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Klinik_Kesehatan_Masyarakat_Indonesia.jpg/800px-Klinik_Kesehatan_Masyarakat_Indonesia.jpg", // Klinik Kesehatan (Wikimedia)
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Pharmacy_storefront_Indonesia.jpg/800px-Pharmacy_storefront_Indonesia.jpg", // Apotek Storefront (Wikimedia)
];

export const FACILITY_DESCRIPTIONS_ARRAY = [
  "Fasilitas medis lengkap dengan teknologi terkini. Dokter spesialis berpengalaman siap melayani 24 jam. Tim medis profesional dan responsif dalam penanganan darurat.",
  "Pelayanan kesehatan terpadu dengan standar internasional. Ruang inap nyaman, steril, dan dilengkapi peralatan canggih. Staf medis terlatih dan bersertifikat.",
  "Klinik modern dengan dokter umum dan spesialis. Fasilitas lengkap untuk pemeriksaan dan perawatan komprehensif. Lingkungan nyaman dan ramah pasien.",
  "Apotek dengan stok obat terlengkap di area. Apoteker profesional siap memberikan konsultasi gratis. Harga kompetitif dan transparan untuk semua produk.",
  "Rumah sakit terpercaya dengan UGD 24 jam non-stop. Dilengkapi ICU, OR, dan ruang perawatan intensif modern. Jaringan kerja sama dengan rumah sakit rujukan.",
  "Klinik kesehatan dengan layanan konsultasi online tersedia. Dokter berpengalaman menangani berbagai keluhan kesehatan. Tarif terjangkau untuk semua kalangan.",
  "Apotek farmasi dengan sistem informasi terintegrasi. Melayani resep dokter dengan akurat dan cepat. Stok obat selalu tersedia dan original terjamin.",
  "Fasilitas kesehatan terakreditasi dengan layanan prima. Ruang tunggu yang luas dan nyaman untuk pasien. Parkir luas dan mudah diakses dari berbagai arah.",
  "Klinik spesialistik melayani berbagai cabang kedokteran. Peralatan diagnostik modern untuk hasil akurat. Jam operasional panjang untuk kemudahan pasien.",
  "Rumah sakit dengan layanan rawat inap berkualitas tinggi. Tim dokter dan perawat profesional tersedia 24/7. Kamar pasien dilengkapi fasilitas modern dan nyaman.",
  "Apotek sosial dengan fokus pada pelayanan masyarakat. Harga obat terjangkau tanpa mengorbankan kualitas. Program loyalitas untuk pelanggan setia.",
  "Klinik terpadu dengan berbagai layanan kesehatan. Vaksinasi, pemeriksaan kesehatan, dan konsultasi tersedia. Lingkungan yang bersih dan terawat baik.",
  "Rumah sakit umum dengan standar layanan excellence. Bed capacity luas dengan tingkat okupansi tinggi. Sistem pemesanan online untuk kemudahan pasien.",
  "Apotek modern dengan self-checkout dan sistem digital. Konsultasi farmasi gratis untuk semua pembeli. Program kesehatan komunitas secara rutin.",
  "Klinik kesehatan dengan dokter umum bersertifikat. Layanan home visit untuk pasien yang tidak bisa datang. Paket medical check-up dengan harga spesial.",
];

/**
 * Get random photo from facility photos array
 * @returns {string} Random facility photo URL
 */
export function getRandomFacilityPhoto(): string {
  return FACILITY_PHOTOS_ARRAY[Math.floor(Math.random() * FACILITY_PHOTOS_ARRAY.length)];
}

/**
 * Get random description from facility descriptions array
 * @returns {string} Random facility description
 */
export function getRandomFacilityDescription(): string {
  return FACILITY_DESCRIPTIONS_ARRAY[Math.floor(Math.random() * FACILITY_DESCRIPTIONS_ARRAY.length)];
}

/**
 * Get random description with custom seed for consistency
 * @param {number} index - Index for consistent randomization
 * @returns {string} Facility description by index
 */
export function getFacilityDescriptionByIndex(index: number): string {
  return FACILITY_DESCRIPTIONS_ARRAY[index % FACILITY_DESCRIPTIONS_ARRAY.length];
}

/**
 * Get random photo with custom seed for consistency
 * @param {number} index - Index for consistent randomization
 * @returns {string} Facility photo by index
 */
export function getFacilityPhotoByIndex(index: number): string {
  return FACILITY_PHOTOS_ARRAY[index % FACILITY_PHOTOS_ARRAY.length];
}
