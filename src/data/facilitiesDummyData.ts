// Dummy data for facilities - photos and descriptions
// Random selection for realistic presentation

export const FACILITY_PHOTOS_ARRAY = [
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&auto=format&fit=crop&q=80", // Hospital 1
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&auto=format&fit=crop&q=80", // Hospital 2
  "https://images.unsplash.com/photo-1631217314707-eb6eca3dd189?w=600&h=400&auto=format&fit=crop&q=80", // Clinic 1
  "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&auto=format&fit=crop&q=80", // Clinic 2
  "https://images.unsplash.com/photo-1581594545050-75e40c9b0f21?w=600&h=400&auto=format&fit=crop&q=80", // Clinic 3
  "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&h=400&auto=format&fit=crop&q=80", // Pharmacy 1
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&auto=format&fit=crop&q=80", // Pharmacy 2
  "https://images.unsplash.com/photo-1576091160396-112ba8d25d1d?w=600&h=400&auto=format&fit=crop&q=80", // Hospital 3
  "https://images.unsplash.com/photo-1631217314707-eb6eca3dd189?w=600&h=400&auto=format&fit=crop&q=80", // Clinic 4
  "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&auto=format&fit=crop&q=80", // Hospital 4
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
