<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\RpsDocument;
use App\Models\Audit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Users
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@sijamu.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $auditor1 = User::create([
            'name' => 'Dr. Auditor Satu',
            'email' => 'auditor1@sijamu.com',
            'password' => Hash::make('password'),
            'role' => 'auditor',
            'identity_number' => 'NIDN001'
        ]);

        $auditor2 = User::create([
            'name' => 'Prof. Auditor Dua',
            'email' => 'auditor2@sijamu.com',
            'password' => Hash::make('password'),
            'role' => 'auditor',
            'identity_number' => 'NIDN002'
        ]);

        $dosen1 = User::create([
            'name' => 'Dosen Budi',
            'email' => 'dosen1@sijamu.com',
            'password' => Hash::make('password'),
            'role' => 'dosen',
            'identity_number' => 'NIDN003'
        ]);

        $dosen2 = User::create([
            'name' => 'Dosen Siti',
            'email' => 'dosen2@sijamu.com',
            'password' => Hash::make('password'),
            'role' => 'dosen',
            'identity_number' => 'NIDN004'
        ]);

        // Courses
        $course1 = Course::create([
            'code' => 'TIF101',
            'name' => 'Algoritma & Pemrograman',
            'credits' => 3,
            'semester' => '1',
        ]);

        $course2 = Course::create([
            'code' => 'TIF201',
            'name' => 'Rekayasa Perangkat Lunak',
            'credits' => 3,
            'semester' => '3',
        ]);

        // RPS Documents
        $rps1 = RpsDocument::create([
            'course_id' => $course1->id,
            'user_id' => $dosen1->id,
            'file_path' => 'rps/TIF101_RPS.pdf',
            'status' => 'pending',
            'upload_date' => Carbon::now()->subDays(5),
        ]);

        $rps2 = RpsDocument::create([
            'course_id' => $course2->id,
            'user_id' => $dosen2->id,
            'file_path' => 'rps/TIF201_RPS.pdf',
            'status' => 'audited',
            'upload_date' => Carbon::now()->subDays(10),
        ]);

        // Audits
        Audit::create([
            'rps_document_id' => $rps2->id,
            'auditor_id' => $auditor1->id,
            'audit_date' => Carbon::now()->subDays(2),
            'score' => 85,
            'notes' => 'Daftar pustaka perlu diperbarui ke edisi terbaru. Selebihnya sudah cukup baik.',
        ]);

        $this->call([
            UploadConfigSeeder::class,
        ]);
    }
}
