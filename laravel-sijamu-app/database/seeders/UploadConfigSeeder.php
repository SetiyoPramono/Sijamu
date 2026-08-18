<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StudyProgram;
use App\Models\DocumentIndicator;

class UploadConfigSeeder extends Seeder
{
    public function run(): void
    {
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

        $docs = [
            ['kode' => 'C1.1', 'nama' => 'Visi, Misi, Tujuan, dan Strategi (VMTS)', 'help' => 'Unggah dokumen VMTS yang telah disahkan Rektor. Format: PDF, maks. 10MB.'],
            ['kode' => 'C1.2', 'nama' => 'Tata Pamong dan Tata Kelola', 'help' => 'Dokumen SOP, SK Pengangkatan, dan Struktur Organisasi. Format: PDF.'],
            ['kode' => 'C1.3', 'nama' => 'Sistem Penjaminan Mutu Internal', 'help' => 'Bukti pelaksanaan audit mutu internal: notulen, laporan, tindak lanjut.'],
            ['kode' => 'C2.1', 'nama' => 'Profil Dosen Tetap', 'help' => 'CV dosen, SK dosen tetap, dan data PDDIKTI. Kumpulkan dalam 1 file ZIP.'],
            ['kode' => 'C2.2', 'nama' => 'Kinerja Dosen (Tri Dharma)', 'help' => 'Laporan kinerja dosen: pengajaran, penelitian, pengabdian masyarakat.'],
            ['kode' => 'C3.1', 'nama' => 'Kurikulum', 'help' => 'Dokumen kurikulum yang didalamnya memuat profil lulusan, CPL, dan RPS.'],
            ['kode' => 'C3.2', 'nama' => 'Pelaksanaan Proses Pembelajaran', 'help' => 'Berita acara perkuliahan, absensi, dan hasil evaluasi pembelajaran.'],
            ['kode' => 'C4.1', 'nama' => 'Penelitian Dosen', 'help' => 'Daftar penelitian, kontrak penelitian, dan laporan akhir. Maks. 2 tahun terakhir.'],
            ['kode' => 'C4.2', 'nama' => 'Pengabdian Kepada Masyarakat', 'help' => 'Dokumen PKM: proposal, laporan, dan foto kegiatan.'],
            ['kode' => 'C5.1', 'nama' => 'Hasil Studi Mahasiswa (IPK dan Lama Studi)', 'help' => 'Data lulusan 3 tahun terakhir: IPK rata-rata dan rata-rata lama studi.'],
            ['kode' => 'C5.2', 'nama' => 'Kepuasan Pengguna Lulusan', 'help' => 'Hasil tracer study atau kuesioner kepuasan pengguna lulusan.'],
            ['kode' => 'C6.1', 'nama' => 'Keuangan dan Sarana Prasarana', 'help' => 'Laporan keuangan prodi dan daftar inventaris sarana-prasarana.']
        ];

        foreach ($docs as $doc) {
            DocumentIndicator::firstOrCreate(
                ['kode' => $doc['kode']],
                ['nama' => $doc['nama'], 'help' => $doc['help']]
            );
        }
    }
}
