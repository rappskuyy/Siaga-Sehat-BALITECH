<div align="center">

<img src="./src/assets/Siaga Sehat.svg" alt="SiagaSehat" width="360" />

### Kesehatanmu, dipantau dengan lebih siaga.

**SiagaSehat** adalah platform skrining kesehatan berbasis AI untuk deteksi dini kondisi kulit &
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

> **Kami tidak hanya mengobati gejala**, kami peduli dengan setiap orang, didukung skrining AI
> yang cepat dan akurat.

SiagaSehat dibangun untuk menjembatani jarak antara "merasa ada yang salah dengan tubuh" dan
"mendapat penanganan yang tepat". Lewat kombinasi computer vision, large language model, dan data
fasilitas kesehatan real-time, pengguna bisa melakukan skrining awal kapan saja, di mana saja,
lalu diarahkan ke langkah selanjutnya yang paling tepat: edukasi mandiri, konsultasi lanjutan, atau
segera ke fasilitas kesehatan terdekat.

---

## ✨ Fitur Utama

### 📷 1. AI Image Scanner (`/scanner`)
Skrining kesehatan awal dari foto yang diunggah atau diambil menggunakan kamera:
- **Objek Analisis:** Ruam kulit, luka, mata merah, jerawat, kuku, lidah, dan tenggorokan.
- **Deteksi Bagian Tubuh:** Memilih area keluhan langsung pada diagram tubuh.
- **Hasil yang Diberikan:** Kemungkinan kondisi, estimasi tingkat risiko, kemungkinan penyebab, saran kapan perlu ke dokter, dan rekomendasi obat/herbal awal.

### 🤖 2. Konsultasi Medis AI (`/consultation`)
Asisten kesehatan virtual berbasis teks untuk tanya-jawab seputar keluhan:
- **Tanya-Jawab Gejala:** Membantu menanyakan keluhan utama, usia, durasi gejala, dan riwayat kesehatan terkait.
- **Hasil Ringkasan:** Menampilkan ringkasan awal kondisi, estimasi tingkat risiko, dan saran perawatan mandiri di rumah.
- **Integrasi Pilihan Anatomi:** Menerima data keluhan yang dipilih dari halaman anatomi tubuh.

### 🧍 3. Visual Anatomi & Eksplorasi Gejala (`/anatomy`)
Model tubuh manusia interaktif untuk membantu pengguna yang sulit menjelaskan lokasi keluhannya:
- **Model Tubuh Interaktif:** Tampilan tampak depan dan tampak belakang dengan opsi pembesaran (*zoom*).
- **Pemilihan Gejala:** Menandai bagian tubuh (kepala, leher, dada, perut, punggung, tangan, kaki) lalu mencentang gejala yang dirasakan.
- **Penilaian Awal AI:** Memberikan perkiraan kemungkinan kondisi berdasarkan kombinasi gejala yang dipilih.

### 📍 4. Peta Fasilitas Kesehatan & Apotek (`/maps`)
Pencarian fasilitas kesehatan terdekat berdasarkan lokasi GPS perangkat atau pin manual di peta:
- **Kategori Faskes:** Rumah Sakit, Puskesmas, Klinik, dan Apotek.
- **Informasi yang Ditampilkan:** Jarak tempuh (km), alamat, jam operasional, nomor telepon faskes, dan rute navigasi.
- **Peta Interaktif:** Didukung oleh OpenStreetMap, Leaflet, dan Google Maps Platform.

### ⏰ 5. Pengingat Minum Obat (`/reminders`)
Pengingat waktu minum obat untuk membantu jadwal minum obat tetap teratur:
- **Pengaturan Jadwal:** Menambahkan obat dari rekomendasi hasil scan/konsultasi atau input mandiri.
- **Dosis & Frekuensi:** Pengaturan jumlah minum per hari (1x, 2x, 3x, 4x) yang otomatis mengatur interval jam.
- **Pencatatan Riwayat:** Tombol *"Sudah Minum Sekarang"*, pengurangan sisa stok tablet otomatis, dan riwayat minum obat.
- **Notifikasi Peramban:** Pengingat web saat jadwal tiba dan ringkasan status obat melalui ikon lonceng di navigasi.

### 💊 6. Rekomendasi Obat Umum & Herbal
Informasi edukatif seputar obat bebas dan tanaman herbal:
- **Obat Bebas (OTC):** Informasi fungsi dan aturan minum obat umum (seperti Paracetamol, Antasida, Oralit).
- **Herbal Tradisional:** Informasi bahan herbal (seperti Jahe, Madu, Kunyit, Temulawak) dan cara pengolahannya.

### 📊 7. Profil & Riwayat Kesehatan (`/profile`)
Halaman pengelolaan data kesehatan dan riwayat pemeriksaan pribadi:
- **Data Kesehatan Dasar:** Tinggi badan, berat badan, usia, dan estimasi Indeks Massa Tubuh (IMT / BMI).
- **Grafik Tren Kesehatan:** Menampilkan riwayat frekuensi pemeriksaan dan catatan kesehatan pengguna.
- **Daftar Riwayat Skrining:** Riwayat scan dan konsultasi tersimpan agar dapat dibuka kembali saat dibutuhkan.

### 🔐 8. Akun & Keamanan Data (`/login` & `/register`)
- **Autentikasi Akun:** Masuk dan daftar akun menggunakan Supabase Auth.
- **Validasi Kata Sandi:** Pengecekan syarat kata sandi (minimal 8 karakter, huruf kapital, dan angka).
- **Perlindungan Data:** Data tersimpan aman dengan dukungan *Row Level Security (RLS)* Supabase.

---

## 🛠️ Teknologi yang Digunakan

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
│   ├── anatomy/         # Anatomy Explorer & assessment AI
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
- 🚀 **Registrasi & Autentikasi** : Panduan membuat akun dan login.
- 📷 **Scan AI & Skrining** : Cara foto kondisi fisik, deteksi bagian tubuh, dan memahami hasil.
- 🤖 **Konsultasi AI** : Tanya jawab interaktif dengan asisten kesehatan AI.
- 🧍 **Anatomy Explorer** : Memilih gejala pada model tubuh manusia.
- 📍 **Peta Fasilitas Kesehatan** : Menemukan RS, Puskesmas, Klinik, dan Apotek terdekat.
- ⏰ **Pengingat Obat** : Menjadwalkan pengingat, input dosis, dan mencatat kepatuhan.

---

## 🤝 Kontribusi

Pull request dan masukan sangat terbuka! Untuk perubahan besar, silakan buka issue terlebih dahulu
agar kita bisa diskusikan arah pengembangannya.

---

<div align="center">

Dibuat dengan 🩵 untuk kesehatan yang lebih siaga • **SiagaSehat, Peduli Kesehatan.**

</div>
