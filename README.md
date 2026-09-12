<div align="center">

<img src="./src/assets/Siaga Sehat.svg" alt="SiagaSehat" width="360" />

### Kesehatanmu, dipantau dengan lebih siaga.

**SiagaSehat** adalah platform skrining kesehatan berbasis AI — deteksi dini kondisi kulit &
kesehatan lewat kamera, konsultasi digital interaktif, peta fasilitas kesehatan terdekat, hingga
pengingat minum obat otomatis, semua dalam satu aplikasi.

[![React](https://img.shields.io/badge/React-19-4A6FA5?logo=react&logoColor=white)](https://react.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-35517D?logo=react-router&logoColor=white)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-4A6FA5?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-35517D?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-099268?logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-4A6FA5?logo=googlegemini&logoColor=white)](https://ai.google.dev/)

</div>

## 🩺 Tentang SiagaSehat

> **Kami tidak hanya mengobati gejala** — kami peduli dengan setiap orang, didukung skrining AI
> yang cepat dan akurat.

SiagaSehat dibangun untuk menjembatani jarak antara "merasa ada yang salah dengan tubuh" dan
"mendapat penanganan yang tepat". Lewat kombinasi computer vision, large language model, dan data
fasilitas kesehatan real-time, pengguna bisa melakukan skrining awal kapan saja, di mana saja —
lalu diarahkan ke langkah selanjutnya yang paling tepat: edukasi mandiri, konsultasi lanjutan, atau
segera ke fasilitas kesehatan terdekat.

---

## ✨ Fitur Utama

### 📷 1. AI Image Scanner (`/scanner`)
Skrining kesehatan visual berbasis Computer Vision AI dari foto yang diunggah atau diambil langsung lewat kamera:
- **Objek Deteksi:** Ruam kulit, luka, mata merah, jerawat, kuku, lidah, hingga keluhan tenggorokan.
- **Deteksi Bagian Tubuh Terintegrasi:** Memilih lokasi keluhan langsung pada diagram tubuh.
- **Hasil Analisis Lengkap:** Kemungkinan kondisi medis, tingkat keyakinan (*confidence score*), estimasi tingkat risiko, kemungkinan penyebab, tanda bahaya, saran kapan harus ke dokter, serta tombol langsung untuk menambahkan ke pengingat obat.

### 🤖 2. Konsultasi Medis AI (`/consultation`)
Asisten kesehatan virtual interaktif 24/7 yang melakukan anamnesis terarah:
- **Tanya-Jawab Cerdas:** Mengidentifikasi keluhan utama, usia, durasi gejala, riwayat penyakit keluarga, hingga riwayat alergi.
- **Triage Medis:** Menyusun *Preliminary Analysis* (ringkasan kondisi), *Risk Assessment* (tingkat urgensi), serta *Health Recommendation* (panduan perawatan mandiri).
- **Integrasi Anatomi:** Menerima data keluhan dari halaman eksplorasi anatomi tubuh.

### 🧍 3. Visual Anatomi & Eksplorasi Gejala (`/anatomy`)
Model tubuh manusia interaktif untuk membantu pengguna memetakan keluhan:
- **Navigasi 3D Multi-Sudut:** Tampilan depan & belakang tubuh dengan fitur pembesaran (*zoom*).
- **Pemilihan Gejala Terarah:** Menandai organ/bagian tubuh (kepala, dada, perut, punggung, tangan, kaki) lalu memilih gejala spesifik yang dirasakan.
- **AI Symptom Assessment:** Menganalisis korelasi antar-gejala dan memberikan rekomendasi rujukan langkah selanjutnya.

### 📍 4. Peta Fasilitas Kesehatan & Apotek (`/maps`)
Pencarian fasilitas kesehatan terdekat berbasis geolokasi GPS pengguna atau penempatan pin manual:
- **Kategori Faskes:** Rumah Sakit Umum & Khusus, Puskesmas, Klinik Pratama, dan Apotek.
- **Informasi Lengkap:** Estimasi jarak tempuh (km), jam operasional (layanan 24 jam/IGD), nomor kontak faskes, serta tombol navigasi rute langsung.
- **Dukungan Multi-Engine:** OpenStreetMap Canvas, Leaflet, dan Google Maps Platform.

### ⏰ 5. Pengingat Minum Obat — Medicine Reminder (`/reminders`)
Sistem pengingat konsumsi obat otomatis untuk menjaga kepatuhan terapi:
- **Setup Jadwal Cerdas:** Otomatis mengambil daftar obat dari riwayat scan/konsultasi terbaru atau input mandiri.
- **Penjadwalan Dosis:** Pilihan frekuensi dosis (1x, 2x, 3x, 4x sehari) yang otomatis menghitung interval jam konsumsi.
- **Pelacakan Stok & Kepatuhan:** Fitur tombol *"Sudah Minum Sekarang"*, penghitungan sisa tablet secara otomatis, peringatan stok menipis, dan log riwayat minum obat.
- **Notifikasi Web & Status Popup:** Notifikasi peramban tepat waktu dan pop-up ringkasan obat aktif melalui ikon lonceng header.

### 💊 6. Rekomendasi Obat Medis & Herbal Alami
Panduan terapi awal yang terverifikasi dan aman:
- **Obat Bebas (OTC):** Informasi fungsi, dosis per minum, dan aturan konsumsi obat umum (misal: Paracetamol, Antasida, Oralit).
- **Herbal Alami:** Alternatif bahan herbal tradisional (misal: Jahe, Madu, Kunyit, Temulawak) beserta cara pengolahan dan manfaat kesehatannya.

### 📊 7. Profil & Rekam Medis Digital (`/profile`)
Pusat manajemen riwayat kesehatan pribadi pengguna:
- **Profil Fisik:** Data tinggi badan, berat badan, umur, dan estimasi otomatis Indeks Massa Tubuh (IMT / BMI).
- **Grafik Tren Kesehatan:** Visualisasi frekuensi skrining dan riwayat kesehatan dari waktu ke waktu menggunakan Recharts.
- **Arsip Riwayat Skrining:** Seluruh riwayat foto scan dan sesi konsultasi tersimpan rapi dan dapat dibuka kembali sebagai bahan rujukan dokter.

### 🔐 8. Autentikasi & Keamanan Data (`/login` & `/register`)
- **Autentikasi Aman:** Sistem akun berbasis Supabase Auth dengan sesi login yang persisten.
- **Validasi Real-time:** Pengecekan kekuatan kata sandi otomatis (minimal 8 karakter, huruf kapital, dan angka).
- **Row Level Security (RLS):** Data rekam medis dan pengingat obat dienkripsi serta diproteksi sehingga hanya dapat diakses oleh pemilik akun.

<details>
<summary><strong>🚧 Roadmap — fitur yang sedang direncanakan</strong></summary>

<br/>

Fitur berikut ada dalam visi produk SiagaSehat dan sedang/berpotensi dikembangkan lebih lanjut:

- **🎤 Speech to Text** — input keluhan lewat suara (*voice input*) yang otomatis diubah menjadi teks percakapan konsultasi AI.
- **📄 OCR Prescription Reader** — pemindaian lembar resep dokter berbasis OCR untuk otomatisasi jadwal pengingat obat.
- **📚 Personalized Health Articles** — artikel edukasi kesehatan yang disesuaikan dengan riwayat keluhan pengguna.

</details>

---

## 🛠️ Tumpukan Teknologi

| Layer | Teknologi |
| --- | --- |
| **Frontend** | React 19, TanStack Start & Router, TypeScript, Tailwind CSS v4 |
| **UI Components** | Radix UI, shadcn-style primitives, Lucide Icons, Framer Motion |
| **AI Engine** | Google Gemini (`gemini-2.5-flash` / `gemini-2.5-pro`) dengan fallback OpenAI |
| **Backend / Auth** | Supabase (Postgres + Row Level Security + Auth) |
| **Peta & Lokasi** | Google Maps Platform, OpenStreetMap (fallback), Leaflet |
| **Data & Grafik** | Recharts, TanStack Query |
| **Tooling** | Vite, ESLint, Prettier, tsx |

---

## 📁 Struktur Proyek

```
src/
├── routes/              # Halaman: beranda, scanner, consultation, anatomy, maps, profile, reminders
├── components/
│   ├── clinic/          # Landing page (Hero, Focus, Services, Footer, dst.)
│   ├── scanner/         # AI Image Analysis, Body Pain Selector, hasil scan
│   ├── anatomy/         # Anatomy Explorer 3D & assessment AI
│   ├── maps/            # Nearby Healthcare Finder
│   ├── reminder/        # Medicine Reminder & notifikasi
│   └── layout/          # Navbar (SiteHeader) & elemen layout bersama
├── lib/
│   ├── ai/               # Integrasi Gemini / OpenAI
│   ├── scanner/          # Server function analisis gambar
│   ├── anatomy/          # Server function assessment gejala
│   ├── reminders/        # Logika penjadwalan pengingat obat
│   └── supabase/         # Client, types, auth context
└── assets/               # Logo, ilustrasi, foto
```


---

## 📖 Panduan Pengguna (User Manual)

Panduan lengkap tata cara penggunaan setiap fitur platform SiagaSehat dapat diakses melalui tombol berikut:

<div align="center">

[![Buka User Manual](https://img.shields.io/badge/📖_Buka_Panduan_Pengguna_(User_Manual)-4A6FA5?style=for-the-badge&logoColor=white)](./usermanual.md)

</div>

Dokumen ini memuat:
- 🚀 **Registrasi & Autentikasi** — Panduan membuat akun dan login.
- 📷 **Scan AI & Skrining** — Cara foto kondisi fisik, deteksi bagian tubuh, dan memahami hasil.
- 🤖 **Konsultasi AI** — Tanya jawab interaktif dengan asisten kesehatan AI.
- 🧍 **Anatomy Explorer** — Memilih gejala pada model tubuh manusia.
- 📍 **Peta Fasilitas Kesehatan** — Menemukan RS, Puskesmas, Klinik, dan Apotek terdekat.
- ⏰ **Pengingat Obat** — Menjadwalkan pengingat, input dosis, dan mencatat kepatuhan.

---

## 🤝 Kontribusi

Pull request dan masukan sangat terbuka! Untuk perubahan besar, silakan buka issue terlebih dahulu
agar kita bisa diskusikan arah pengembangannya.

---

<div align="center">

Dibuat dengan 🩵 untuk kesehatan yang lebih siaga — **SiagaSehat, Peduli Kesehatan.**

</div>
