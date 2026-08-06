Berikut adalah Product Requirements Document (PRD) SIJAMU 2.0 yang secara khusus difokuskan pada **pendekatan antarmuka _Universal Design_ (Ramah Segala Usia)**.

Mengingat pengguna sistem ini bervariasi dari staf IT muda hingga Profesor senior yang menjabat sebagai Asesor/Auditor, sistem ini harus meminimalkan kebingungan, mengurangi beban kognitif, dan sangat mudah dinavigasi tanpa perlu buku panduan tebal.

---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**SIJAMU 2.0 – UNIVERSITAS PGRI BANYUWANGI**
**Tanggal:** 5 Agustus 2026
**Owner:** MasTyo
**Fokus Rilis:** Optimalisasi UI/UX, Alur Kerja Rule-Based, dan Aksesibilitas

---

## 1. Visi Produk & Filosofi Desain

**Visi:** Menyediakan platform penjaminan mutu yang fungsional, terstruktur, dan dapat digunakan dengan nyaman oleh seluruh civitas akademika lintas generasi—dari staf prodi berusia 20-an hingga auditor senior berusia 60-an.

**Filosofi Desain (Don't Make Me Think):**
Tidak ada menu tersembunyi, tidak ada jargon yang membingungkan, dan tidak ada keharusan membuka banyak _tab_ yang membuat pengguna tersesat. Semua tindakan harus eksplisit dan berpanduan (_guided_).

---

## 2. Profil Pengguna & Solusi UX (User Experience)

| Pengguna              | Rentang Usia   | Tantangan Teknologi (Pain Points)                                                                             | Solusi Antarmuka (UX) di SIJAMU 2.0                                                                           |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Auditor / Asesor**  | 45 - 65+ Tahun | Sering tersesat saat banyak _tab_ browser terbuka; kesulitan membaca teks kecil; bingung mencari letak _file_ | UI _Split-Screen_ (Dokumen di kiri, Rubrik di kanan dalam 1 layar); _Font_ besar; Tombol aksi kontras tinggi. |
| **Dekan / Pimpinan**  | 45 - 60+ Tahun | Terlalu sibuk untuk belajar aplikasi baru; hanya butuh melihat rekap                                          | _Dashboard_ visual berbasis warna (Hijau/Kuning/Merah); Grafik besar yang bisa diklik.                        |
| **Koprodi**           | 35 - 55 Tahun  | Bingung alur "habis ini harus klik apa"; kewalahan memantau kelengkapan                                       | Desain _Step-by-Step_ (Wizard); _Progress Bar_ persentase yang jelas di halaman depan.                        |
| **Task Force / Staf** | 22 - 35 Tahun  | Pekerjaan repetitif memakan waktu; sering salah letak dokumen                                                 | Form _Upload_ dengan kotak _drag-and-drop_ besar; _Auto-folder_ yang tidak bisa diubah strukturnya.           |

---

## 3. Prinsip Desain UI/UX (Aturan Baku Tampilan)

Untuk memastikan aplikasi "enak dilihat dan digunakan segala usia", pengembang UI/UX wajib mematuhi standar berikut:

1. **Tipografi & Keterbacaan:**

- Menggunakan _font_ Sans-Serif yang bersih (misal: Inter, Roboto, atau sistem bawaan).
- Ukuran teks dasar (_body text_) minimal **16px** untuk PC dan **14px** untuk _mobile_.
- Dilarang menggunakan teks abu-abu muda di atas latar putih. Kontras teks harus tinggi (memenuhi standar WCAG 2.1 AA).

2. **Navigasi & Tata Letak:**

- **Sidebar Eksplisit:** Menu di samping kiri harus menampilkan **Ikon + Teks**. Dilarang menggunakan menu yang hanya berupa ikon (karena pengguna senior sering tidak paham arti ikon abstrak).
- **Breadcrumbs (Jejak Roti):** Selalu tampilkan posisi pengguna di atas halaman (Contoh: _Beranda > Evaluasi Diri > Kriteria 1 > Unggah Dokumen_).

3. **Interaksi Tombol (Call to Action):**

- Tombol utama (misal: "Simpan", "Kirim Laporan") harus besar, menggunakan warna dominan institusi (misal: Biru/Hijau), dan memiliki label teks yang jelas, bukan sekadar ikon disket.
- **Dilarang** menggunakan aksi yang mengharuskan klik kanan (_right-click_) atau _hover_ (harus disentuh kursor baru muncul). Semua menu harus terlihat langsung.

4. **Pencegahan Kesalahan (Error Prevention):**

- Jika pengguna menekan tombol "Hapus" atau "Kembali", selalu munculkan _pop-up_ peringatan besar: _"Apakah Anda yakin? Data yang belum disimpan akan hilang."_
- Gunakan tombol _undo_ (Batal) setelah melakukan aksi penting.

---

## 4. Fitur Fungsional Inti (Penyesuaian UI)

### A. Workspace Auditor (Ruang Evaluasi Split-Screen)

- **Kebutuhan:** Auditor tidak perlu mengunduh _file_ atau membuka banyak jendela.
- **Desain UI:** Layar otomatis terbagi dua.
- **60% Kiri:** _Document Viewer_ (Penampil PDF terintegrasi dengan tombol _zoom in/out_ yang besar).
- **40% Kanan:** Form Penilaian. Berisi rubrik (teks besar), _dropdown_ "Pilih Temuan Standar" (Bank Rekomendasi), dan kolom input nilai.
- **Navigasi:** Tombol "Sebelumnya" dan "Selanjutnya" yang tebal di bagian bawah untuk pindah antar indikator.

### B. Guided Document Upload (Pengunggahan Terpandu)

- **Kebutuhan:** Task force tidak bingung menyusun folder.
- **Desain UI:**
- Bukan tampilan layaknya Google Drive yang kosong, melainkan bentuk **Tabel Checklist**.
- Setiap baris berisi Nama Indikator, dan di sebelahnya ada tombol besar bertuliskan **"➕ Unggah Bukti"**.
- Area unggah mendukung fitur _Drag-and-Drop_ kotak besar.
- Setelah sukses, status baris berubah warna menjadi hijau dengan centang tebal (✔️).

### C. Executive Dashboard (Pemantauan Visual)

- **Kebutuhan:** Pimpinan butuh laporan yang langsung bisa dicerna dalam 5 detik.
- **Desain UI:**
- _Progress Bar_ raksasa berbentuk donat atau batang untuk kelengkapan dokumen.
- **Traffic Light System:** Tabel status mutu dengan warna mencolok. Hijau (Aman/Sesuai), Kuning (Perlu Perhatian), Merah (Kritis/Belum Dikerjakan).
- Hanya menampilkan angka kunci (Misal: "15 Indikator Kurang Dokumen").

### D. Bantuan Kontekstual (Buku Panduan Tanpa Buku)

- **Kebutuhan:** Pengguna yang lupa aturan tidak perlu mencari file PDF panduan.
- **Desain UI:** Di sebelah setiap pertanyaan/indikator, terdapat ikon tanda tanya **[?]** berwarna biru terang. Jika diklik, akan muncul _pop-up card_ berisi penjelasan instrumen, cara mengisi, dan contoh dokumen.

---

## 5. Alur Pengguna (User Flow) yang Disederhanakan

**Contoh: Alur Mengisi Nilai oleh Auditor**

1. Masuk ke halaman Beranda -> Klik kotak besar bertuliskan _"Daftar Tugas Audit Anda"_.
2. Pilih Prodi dari tabel -> Klik tombol biru _"Mulai Evaluasi"_.
3. Sistem membawa ke layar _Split-Screen_. Auditor membaca dokumen di kiri, lalu memilih nilai di kanan.
4. Klik tombol _"Simpan & Lanjut ke Indikator Berikutnya"_ di pojok kanan bawah.
5. Di akhir, muncul halaman _Review_ (Rekap) -> Klik tombol hijau _"Kunci & Kirim Laporan"_.
   _(Alur linear satu arah, pengguna tidak akan tersesat)_

---

## 6. Metrik Keberhasilan (Fokus pada Usability)

| Metrik (Key Results)                       | Target (Tahun 1)                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Penurunan Waktu Orientasi (Onboarding)** | Pengguna baru bisa menggunakan sistem tanpa pelatihan formal dalam < 15 menit.     |
| **Error Rate (Kesalahan Klik/Upload)**     | Berkurang 50% dibandingkan penggunaan Google Drive/sistem lama.                    |
| **Support Ticket/Pertanyaan ke Admin**     | Keluhan "Bagaimana cara upload?" atau "Di mana letak dokumen X?" turun hingga 80%. |
| **Task Completion Rate**                   | 95% auditor menyelesaikan input nilai tanpa membutuhkan bantuan teknis.            |

---

## 7. Persyaratan Teknis (Pendukung UI/UX)

1. **Responsivitas (Mobile-Friendly):** Aplikasi harus tetap rapi dibuka dari tablet (iPad/Galaxy Tab) mengingat banyak asesor lebih suka membaca dokumen menggunakan tablet di ruang _meeting_.
2. **Kecepatan Muat (Loading Speed):** Penampil dokumen (_Document Viewer_) harus memuat halaman pertama PDF dalam waktu kurang dari 3 detik untuk mencegah pengguna mengira aplikasi _error_ (tambahkan animasi _loading_ bundar yang jelas saat sistem bekerja).
3. **Session Timeout yang Aman:** Jika sesi _login_ habis karena pengguna lama membaca dokumen, sistem harus otomatis menyimpan (_auto-save_) isian terakhir di _draft_, dan memberikan pesan yang ramah saat mereka diminta _login_ kembali.
