<?php

namespace Database\Seeders;

use App\Models\ReportLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReportLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'mastyo@sijamu.com')->first();
        $auditor = User::where('role', 'auditor')->first();

        $userId = $admin ? $admin->id : ($auditor ? $auditor->id : null);

        $logs = [
            [
                'user_id' => $userId,
                'report_type' => 'Laporan Evaluasi Diri (LED)',
                'prodi_name' => 'Teknik Informatika',
                'status' => 'Selesai',
                'created_at' => now()->subDays(3)->setTime(9, 30),
            ],
            [
                'user_id' => $userId,
                'report_type' => 'Laporan Kinerja Program Studi (LKPS)',
                'prodi_name' => 'Teknik Informatika',
                'status' => 'Selesai',
                'created_at' => now()->subDays(2)->setTime(14, 15),
            ],
            [
                'user_id' => $userId,
                'report_type' => 'Rekap Kelengkapan Dokumen',
                'prodi_name' => 'Pendidikan Matematika',
                'status' => 'Selesai',
                'created_at' => now()->subDay()->setTime(11, 0),
            ],
            [
                'user_id' => $userId,
                'report_type' => 'Laporan Temuan Audit',
                'prodi_name' => 'Semua Prodi',
                'status' => 'Selesai',
                'created_at' => now()->subHours(4),
            ],
        ];

        foreach ($logs as $log) {
            ReportLog::firstOrCreate(
                [
                    'report_type' => $log['report_type'],
                    'prodi_name' => $log['prodi_name'],
                    'status' => $log['status'],
                ],
                $log
            );
        }
    }
}
