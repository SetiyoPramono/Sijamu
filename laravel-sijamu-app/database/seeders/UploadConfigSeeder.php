<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use App\Models\DocumentIndicator;
use App\Models\DocumentIndicatorCriteria;
use App\Models\StudyProgram;
use Illuminate\Database\Seeder;

class UploadConfigSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Program Studi
        $prodis = [
            'Teknik Informatika',
            'Pendidikan Matematika',
            'Manajemen',
            'Pendidikan Bahasa Inggris',
            'Akuntansi',
            'Pendidikan IPA',
            'Hukum'
        ];

        foreach ($prodis as $prodi) {
            StudyProgram::firstOrCreate(['name' => $prodi]);
        }

        // 2. Kategori Dokumen Akreditasi (9 Kriteria SPMI / BAN-PT / LAM)
        $categories = [
            'C1' => [
                'name' => 'Kriteria 1 - Visi, Misi, Tujuan, dan Strategi',
                'description' => 'Dokumen perumusan, sosialisasi, dan implementasi VMTS institusi dan program studi.',
            ],
            'C2' => [
                'name' => 'Kriteria 2 - Tata Pamong, Tata Kelola, dan Kerjasama',
                'description' => 'Struktur organisasi, kepemimpinan, SPMI, dan kerjasama tridharma perguruan tinggi.',
            ],
            'C3' => [
                'name' => 'Kriteria 3 - Mahasiswa dan Kemahasiswaan',
                'description' => 'Sistem seleksi mahasiswa baru, daya tarik prodi, dan layanan pembinaan kemahasiswaan.',
            ],
            'C4' => [
                'name' => 'Kriteria 4 - Sumber Daya Manusia',
                'description' => 'Profil dosen tetap, kualifikasi akademik, jabatan fungsional, dan tenaga kependidikan.',
            ],
            'C5' => [
                'name' => 'Kriteria 5 - Keuangan, Sarana, dan Prasarana',
                'description' => 'Pengelolaan anggaran operasional, sarana pembelajaran, laboratorium, dan perpustakaan.',
            ],
            'C6' => [
                'name' => 'Kriteria 6 - Pendidikan dan Kurikulum',
                'description' => 'Struktur kurikulum OBE, CPL, RPS, proses pembelajaran, dan integrasi hasil penelitian.',
            ],
            'C7' => [
                'name' => 'Kriteria 7 - Penelitian',
                'description' => 'Rencana strategis penelitian dosen dan mahasiswa, pendanaan riset, dan publikasi ilmiah.',
            ],
            'C8' => [
                'name' => 'Kriteria 8 - Pengabdian kepada Masyarakat (PkM)',
                'description' => 'Kegiatan pengabdian masyarakat, penerapan keilmuan, dan kemitraan dengan masyarakat/industri.',
            ],
            'C9' => [
                'name' => 'Kriteria 9 - Luaran dan Capaian Tridharma',
                'description' => 'Indeks prestasi kumulatif, masa studi, tracer study lulusan, dan kepuasan pengguna.',
            ],
        ];

        $categoryModels = [];
        foreach ($categories as $key => $cat) {
            $categoryModels[$key] = DocumentCategory::updateOrCreate(
                ['name' => $cat['name']],
                ['description' => $cat['description']]
            );
        }

        // 3. Indikator Dokumen SPMI
        $docs = [
            [
                'cat' => 'C1',
                'kode' => 'C1.1',
                'nama' => 'Visi, Misi, Tujuan, dan Strategi (VMTS)',
                'help' => 'Dokumen VMTS yang disahkan pimpinan institusi beserta bukti sosialisasi dan ketercapaian target. Format: PDF.',
            ],
            [
                'cat' => 'C2',
                'kode' => 'C2.1',
                'nama' => 'Tata Pamong, Tata Kelola, dan SOP',
                'help' => 'Dokumen SOP, struktur organisasi prodi, tupoksi, dan SK pengangkatan pengelola. Format: PDF.',
            ],
            [
                'cat' => 'C2',
                'kode' => 'C2.2',
                'nama' => 'Sistem Penjaminan Mutu Internal (SPMI)',
                'help' => 'Laporan pelaksanaan siklus PPEPP, dokumen audit mutu internal (AMI), dan laporan tindak lanjut (RTL).',
            ],
            [
                'cat' => 'C3',
                'kode' => 'C3.1',
                'nama' => 'Layanan dan Pembinaan Kemahasiswaan',
                'help' => 'Pedoman layanan mahasiswa (bimbingan konseling, minat bakat, beasiswa, dan karir).',
            ],
            [
                'cat' => 'C4',
                'kode' => 'C4.1',
                'nama' => 'Profil dan Kualifikasi Dosen Tetap',
                'help' => 'Daftar dosen tetap prodi, ijazah terakhir, SK dosen, dan sertifikat pendidik/kompetensi. Format: PDF.',
            ],
            [
                'cat' => 'C4',
                'kode' => 'C4.2',
                'nama' => 'Kinerja Tridharma Dosen (BKD)',
                'help' => 'Laporan Beban Kerja Dosen (BKD) semester gasal dan genap dalam 2 tahun terakhir.',
            ],
            [
                'cat' => 'C5',
                'kode' => 'C5.1',
                'nama' => 'Alokasi dan Realisasi Anggaran Prodi',
                'help' => 'Laporan keuangan prodi: biaya operasional pembelajaran, penelitian, dan PkM per mahasiswa.',
            ],
            [
                'cat' => 'C5.2',
                'kode' => 'C5.2',
                'nama' => 'Sarana dan Prasarana Pembelajaran',
                'help' => 'Daftar inventaris ruang kuliah, laboratorium, lisensi perangkat lunak, dan akses jurnal/e-library.',
            ],
            [
                'cat' => 'C6',
                'kode' => 'C6.1',
                'nama' => 'Dokumen Kurikulum, CPL, dan Struktur Mata Kuliah',
                'help' => 'Buku pedoman kurikulum berbasis OBE/KKNI memuat Profil Lulusan, Capaian Pembelajaran, dan Matriks Mata Kuliah.',
            ],
            [
                'cat' => 'C6',
                'kode' => 'C6.2',
                'nama' => 'Pelaksanaan & Evaluasi Proses Pembelajaran',
                'help' => 'Berita acara perkuliahan, daftar hadir mahasiswa/dosen, serta evaluasi kepuasan mahasiswa (EDOM).',
            ],
            [
                'cat' => 'C7',
                'kode' => 'C7.1',
                'nama' => 'Penelitian Dosen dan Keterlibatan Mahasiswa',
                'help' => 'Daftar judul penelitian, laporan akhir penelitian, dan bukti publikasi pada jurnal terakreditasi/internasional.',
            ],
            [
                'cat' => 'C8',
                'kode' => 'C8.1',
                'nama' => 'Pengabdian kepada Masyarakat (PkM)',
                'help' => 'Proposal dan laporan kegiatan PkM dosen bersama mahasiswa yang memberikan dampak bagi masyarakat/mitra.',
            ],
            [
                'cat' => 'C9',
                'kode' => 'C9.1',
                'nama' => 'IPK Lulusan dan Ketepatan Waktu Studi',
                'help' => 'Data statistik IPK lulusan 3 tahun terakhir dan persentase kelulusan tepat waktu.',
            ],
            [
                'cat' => 'C9',
                'kode' => 'C9.2',
                'nama' => 'Tracer Study dan Kepuasan Pengguna Lulusan',
                'help' => 'Hasil survei pelacakan alumni (waktu tunggu kerja) dan umpan balik kepuasan dari instansi pengguna lulusan.',
            ],
        ];

        // 4. Rubrik Penilaian Standar untuk Tiap Indikator
        $defaultCriterias = [
            ['label' => 'Tidak Tersedia', 'bobot' => 0, 'kriteria' => 'Bukti, dokumen, data, atau informasi yang dipersyaratkan tidak tersedia sehingga indikator tidak dapat diverifikasi.'],
            ['label' => 'Tidak Sesuai', 'bobot' => 1, 'kriteria' => 'Bukti tersedia, namun belum memenuhi indikator, persyaratan, atau standar yang ditetapkan.'],
            ['label' => 'Sesuai', 'bobot' => 3, 'kriteria' => 'Bukti tersedia dan menunjukkan bahwa indikator telah memenuhi standar yang ditetapkan.'],
            ['label' => 'Melampaui', 'bobot' => 4, 'kriteria' => 'Bukti menunjukkan pencapaian yang melebihi standar, target, atau praktik baik yang dipersyaratkan.'],
            ['label' => 'N/A', 'bobot' => null, 'kriteria' => 'Indikator tidak relevan atau tidak berlaku pada unit yang diaudit sehingga tidak diperhitungkan dalam evaluasi.'],
            ['label' => 'Belum Dinilai', 'bobot' => null, 'kriteria' => 'Indikator, dokumen, atau bukti terkait belum diperiksa, dievaluasi, atau diverifikasi oleh auditor.'],
        ];

        foreach ($docs as $docData) {
            $catModel = $categoryModels[$docData['cat']] ?? null;

            $indicator = DocumentIndicator::updateOrCreate(
                ['kode' => $docData['kode']],
                [
                    'nama' => $docData['nama'],
                    'help' => $docData['help'],
                    'document_category_id' => $catModel ? $catModel->id : null,
                ]
            );

            // Buat kriteria jika belum ada
            if ($indicator->criteria()->count() === 0) {
                foreach ($defaultCriterias as $crit) {
                    $indicator->criteria()->create($crit);
                }
            }
        }
    }
}
