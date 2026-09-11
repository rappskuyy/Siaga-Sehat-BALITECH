<div align="center">

<img src="./assets/Siaga_Sehat.svg" alt="Logo SiagaSehat" width="320" />

# Panduan Pengguna (User Manual)
## Aplikasi SiagaSehat

Dokumen ini disusun sebagai panduan resmi penggunaan platform **SiagaSehat**, yang dapat diakses melalui **[siagasehat.smkwikrama.sch.id](https://siagasehat.smkwikrama.sch.id)**.

</div>

---

## Daftar Isi

1. [Tentang SiagaSehat](#1-tentang-siagasehat)
2. [Persyaratan Penggunaan](#2-persyaratan-penggunaan)
3. [Memulai Penggunaan](#3-memulai-penggunaan)
4. [Pendaftaran dan Masuk Akun](#4-pendaftaran-dan-masuk-akun)
5. [Panduan Penggunaan Fitur](#5-panduan-penggunaan-fitur)
   1. [Pemindaian Kesehatan Berbasis Kecerdasan Buatan (Scan AI)](#51-pemindaian-kesehatan-berbasis-kecerdasan-buatan-scan-ai)
   2. [Konsultasi Kesehatan Berbasis Kecerdasan Buatan](#52-konsultasi-kesehatan-berbasis-kecerdasan-buatan)
   3. [Eksplorasi Anatomi Tubuh](#53-eksplorasi-anatomi-tubuh)
   4. [Peta Fasilitas Kesehatan Terdekat](#54-peta-fasilitas-kesehatan-terdekat)
   5. [Pengingat Konsumsi Obat](#55-pengingat-konsumsi-obat)
   6. [Profil dan Riwayat Kesehatan](#56-profil-dan-riwayat-kesehatan)
6. [Pertanyaan yang Sering Diajukan](#6-pertanyaan-yang-sering-diajukan)
7. [Bantuan dan Kontak](#7-bantuan-dan-kontak)

---

## 1. Tentang SiagaSehat

SiagaSehat merupakan platform skrining kesehatan berbasis kecerdasan buatan yang dirancang untuk membantu pengguna mengenali kemungkinan kondisi kesehatan sejak dini. Melalui kombinasi teknologi pengenalan gambar, model bahasa besar, dan data fasilitas kesehatan secara langsung, pengguna dapat melakukan skrining awal kapan saja dan di mana saja, kemudian diarahkan pada langkah lanjutan yang sesuai, baik berupa edukasi mandiri, konsultasi lanjutan, maupun rujukan ke fasilitas kesehatan terdekat.

**Catatan penting:** Seluruh hasil analisis yang diberikan oleh SiagaSehat bersifat edukatif dan tidak dimaksudkan untuk menggantikan diagnosis dokter. Dalam kondisi darurat, pengguna disarankan untuk segera menghubungi instalasi gawat darurat (IGD) atau fasilitas kesehatan terdekat.

---

## 2. Persyaratan Penggunaan

Untuk menggunakan SiagaSehat, pengguna memerlukan hal-hal berikut.

- Perangkat dengan akses internet, baik telepon pintar (smartphone) maupun komputer/laptop.
- Peramban (browser) yang telah diperbarui ke versi terbaru, misalnya Google Chrome, Mozilla Firefox, atau Safari.
- Tidak diperlukan instalasi aplikasi tambahan karena SiagaSehat berjalan sepenuhnya melalui peramban web.

---

## 3. Memulai Penggunaan

1. Buka peramban pada perangkat yang digunakan.
2. Kunjungi alamat **[siagasehat.smkwikrama.sch.id](https://siagasehat.smkwikrama.sch.id)**.
3. Halaman beranda akan menampilkan ringkasan layanan yang tersedia beserta menu navigasi utama.
4. Pengguna dapat langsung mencoba fitur skrining tanpa mendaftar akun terlebih dahulu, meskipun pembuatan akun disarankan untuk memperoleh pengalaman yang lebih lengkap.

---

## 4. Pendaftaran dan Masuk Akun

### 4.1 Membuat Akun Baru

1. Pilih menu **Register** pada bagian navigasi, atau kunjungi langsung halaman **[Daftar](https://siagasehat.smkwikrama.sch.id/register)**.
2. Isi kolom **Nama Lengkap**, **Alamat Surel (Email)**, dan **Kata Sandi**.
3. Lengkapi kolom **Data Kesehatan** yang bersifat opsional, meliputi tinggi badan (cm), berat badan (kg), dan usia, agar rekomendasi yang diberikan sistem menjadi lebih sesuai dengan kondisi pengguna.
4. Pilih tombol **Daftar Sekarang** untuk menyelesaikan proses pendaftaran.

### 4.2 Masuk ke Akun

1. Pilih menu **Login** pada bagian navigasi, atau kunjungi halaman **[Masuk](https://siagasehat.smkwikrama.sch.id/login)**.
2. Masukkan alamat surel dan kata sandi yang telah terdaftar.
3. Pilih tombol **Masuk** untuk mengakses akun.

### 4.3 Manfaat Memiliki Akun

Dengan memiliki akun terdaftar, pengguna memperoleh manfaat berikut.

- Riwayat konsultasi kecerdasan buatan tersimpan secara otomatis.
- Rekomendasi kesehatan yang lebih personal sesuai data yang dilengkapi.
- Fitur pengingat konsumsi obat dapat diaktifkan.
- Penggunaan fitur pemindaian (Scan AI) tanpa batas jumlah.

Data pengguna disimpan dan dilindungi dengan mekanisme Row Level Security dari penyedia layanan basis data Supabase.

---

## 5. Panduan Penggunaan Fitur

### 5.1 Pemindaian Kesehatan Berbasis Kecerdasan Buatan (Scan AI)

Fitur ini digunakan untuk menganalisis kondisi kulit atau bagian tubuh tertentu melalui foto. Fitur dapat diakses melalui menu **Scan AI** pada navigasi, atau langsung melalui halaman **[/scanner](https://siagasehat.smkwikrama.sch.id/scanner)**.

**Langkah penggunaan:**

1. Pilih area unggah foto, kemudian seret dan lepas berkas foto, atau klik untuk memilih berkas dari perangkat. Format berkas yang didukung adalah JPG, PNG, dan WebP.
2. Sebagai alternatif, pengguna dapat memilih opsi **Ambil Foto Langsung** untuk mengambil gambar menggunakan kamera perangkat secara langsung.
3. Perhatikan panduan pengambilan foto berikut agar hasil analisis lebih akurat.
   - Gunakan pencahayaan alami atau lampu yang terang dan merata.
   - Ambil foto dari jarak dekat dengan fokus pada area yang menjadi keluhan.
   - Gunakan latar belakang polos tanpa gangguan visual.
   - Hindari penggunaan filter atau penyuntingan foto.
   - Hindari foto yang buram, bergerak, atau tertutup bayangan.
4. Pilih tombol **Scan Sekarang** untuk memulai proses analisis.
5. Sistem akan menampilkan hasil berupa kemungkinan kondisi, tingkat keyakinan analisis, tingkat risiko, kemungkinan penyebab, serta saran penanganan awal.

### 5.2 Konsultasi Kesehatan Berbasis Kecerdasan Buatan

Fitur ini menyediakan sesi tanya jawab interaktif dengan asisten kesehatan berbasis kecerdasan buatan. Fitur dapat diakses melalui menu **Konsultasi Medis AI**, atau langsung melalui halaman **[/consultation](https://siagasehat.smkwikrama.sch.id/consultation)**.

**Langkah penggunaan:**

1. Ketik keluhan kesehatan pada kolom percakapan yang tersedia, atau pilih salah satu contoh keluhan yang telah disediakan sistem, misalnya demam disertai lemas, mual dan nyeri lambung, atau sakit kepala.
2. Tekan tombol Enter atau tombol kirim untuk menyampaikan pesan.
3. Jawab pertanyaan lanjutan yang diajukan oleh sistem, seperti usia, durasi gejala, serta riwayat kesehatan terkait.
4. Sistem akan menyusun ringkasan kondisi awal, perkiraan tingkat risiko, dan rekomendasi langkah lanjutan yang perlu diambil pengguna.

Fitur ini dapat diakses selama dua puluh empat jam. Meskipun demikian, apabila kondisi tergolong darurat, pengguna tetap disarankan untuk segera menghubungi fasilitas gawat darurat terdekat dan tidak semata-mata mengandalkan hasil konsultasi daring.

### 5.3 Eksplorasi Anatomi Tubuh

Fitur ini menampilkan model tubuh interaktif untuk membantu pengguna mengidentifikasi gejala berdasarkan lokasi keluhan pada tubuh. Fitur dapat diakses melalui menu **Visual Penyakit**, atau langsung melalui halaman **[/anatomy](https://siagasehat.smkwikrama.sch.id/anatomy)**.

**Fitur ini terdiri atas empat tahap:**

1. **Panduan** — membaca ringkasan singkat mengenai tata cara penggunaan sebelum memulai pemeriksaan.
2. **Model Anatomi** — memilih titik pada model tubuh, baik pada tampilan depan maupun belakang, sesuai lokasi keluhan. Tombol Depan/Belakang digunakan untuk mengganti sudut pandang, sedangkan tombol Zoom digunakan untuk memperbesar tampilan model.
3. **Gejala** — memilih gejala klinis atau keluhan spesifik yang dirasakan pada bagian tubuh yang telah ditandai.
4. **Hasil** — sistem menampilkan kemungkinan kondisi, mendeteksi tanda-tanda kondisi darurat apabila ada, serta memberikan saran untuk melakukan rujukan ke dokter bila diperlukan.

### 5.4 Peta Fasilitas Kesehatan Terdekat

Fitur ini digunakan untuk menemukan lokasi fasilitas kesehatan di sekitar pengguna. Fitur dapat diakses melalui menu **Peta Faskes**, atau langsung melalui halaman **[/maps](https://siagasehat.smkwikrama.sch.id/maps)**.

**Langkah penggunaan:**

1. Berikan izin akses lokasi pada peramban ketika diminta, agar hasil pencarian menampilkan fasilitas yang sesuai dengan posisi pengguna.
2. Sistem akan menampilkan daftar rumah sakit, klinik, pusat kesehatan masyarakat (puskesmas), dan apotek terdekat, lengkap dengan informasi jarak dan jam operasional.
3. Gunakan informasi tersebut untuk menentukan fasilitas kesehatan yang sesuai kebutuhan, termasuk fasilitas dengan layanan gawat darurat selama dua puluh empat jam atau yang menerima BPJS Kesehatan.
4. Ikuti petunjuk rute navigasi yang ditampilkan sistem menuju fasilitas yang dipilih.

### 5.5 Pengingat Konsumsi Obat

Fitur ini digunakan untuk mengatur pengingat waktu minum obat serta jadwal kontrol dan pemeriksaan kesehatan rutin. Fitur ini memerlukan akun yang telah masuk (login) untuk dapat digunakan.

**Langkah penggunaan:**

1. Masuk ke akun pengguna terlebih dahulu.
2. Buka menu Pengingat pada aplikasi.
3. Tambahkan jadwal baru dengan mengisi nama obat, waktu konsumsi, dan jumlah stok yang dimiliki.
4. Sistem akan mengirimkan notifikasi secara otomatis sesuai jadwal yang telah ditentukan, sekaligus mencatat riwayat kepatuhan konsumsi obat dan sisa stok yang tersedia.

### 5.6 Profil dan Riwayat Kesehatan

Fitur ini menampilkan data pribadi serta riwayat penggunaan layanan kesehatan pengguna. Fitur dapat diakses melalui menu **Profile**, atau langsung melalui halaman **[/profile](https://siagasehat.smkwikrama.sch.id/profile)**.

Pada halaman ini, pengguna dapat melakukan hal berikut.

- Melihat dan memperbarui data dasar kesehatan, meliputi tinggi badan, berat badan, usia, dan estimasi indeks massa tubuh (IMT).
- Menelusuri riwayat hasil pemindaian (Scan AI) dan konsultasi kecerdasan buatan yang disajikan dalam bentuk grafik perkembangan dari waktu ke waktu.
- Menjadikan riwayat tersebut sebagai bahan pertimbangan atau bahan diskusi pada saat berkonsultasi dengan dokter.

---

## 6. Pertanyaan yang Sering Diajukan

**Apakah SiagaSehat dapat menggantikan peran dokter?**

Tidak. SiagaSehat hanya berfungsi sebagai alat bantu triase awal, yaitu mengenali kemungkinan kondisi kesehatan beserta tingkat urgensinya, sehingga pengguna dapat menentukan langkah selanjutnya dengan lebih cepat. Untuk memperoleh diagnosis resmi dan penanganan medis, pengguna tetap perlu berkonsultasi dengan dokter yang memiliki izin praktik.

**Apakah layanan ini dikenakan biaya?**

Fitur dasar, yaitu Scan AI dan Konsultasi AI, dapat digunakan tanpa biaya. Sebagian fitur lanjutan, seperti penyimpanan riwayat tanpa batas dan konsultasi langsung dengan dokter, disediakan melalui paket berbayar.

**Berapa lama waktu yang dibutuhkan untuk memperoleh hasil?**

Secara umum, hasil pemindaian (Scan) diperoleh dalam waktu kurang dari tiga puluh detik, sedangkan balasan pada fitur Konsultasi AI ditampilkan hampir seketika. Kecepatan tersebut dapat dipengaruhi oleh kualitas koneksi internet yang digunakan.

---

## 7. Bantuan dan Kontak

Apabila pengguna mengalami kendala teknis atau memiliki masukan terhadap layanan, tim pengembang dapat dihubungi melalui saluran berikut.

| Saluran | Tautan |
|---|---|
| WhatsApp | [wa.me/6285770485228](https://wa.me/6285770485228) |
| LinkedIn Sekolah | [SMK Wikrama Bogor](https://www.linkedin.com/school/smkwikramabogor) |
| Repositori GitHub | [Siaga-Sehat-BALITECH](https://github.com/rappskuyy/Siaga-Sehat-BALITECH) |
| Profil Tim Pengembang | [Tim Pengembang BALITECH](https://siagasehat.smkwikrama.sch.id/dev) |

---

<div align="center">

Dokumen ini disusun sebagai panduan resmi penggunaan SiagaSehat.
Karya siswa SMK Wikrama Bogor, tim pengembang BALITECH.

</div>
