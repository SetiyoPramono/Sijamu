<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prodiTif = StudyProgram::where('name', 'Teknik Informatika')->first();
        $prodiMat = StudyProgram::where('name', 'Pendidikan Matematika')->first();
        $prodiMnj = StudyProgram::where('name', 'Manajemen')->first();
        $prodiHuk = StudyProgram::where('name', 'Hukum')->first();

        $dosenHendra = User::where('email', 'hendra.wijaya@sijamu.com')->first();
        $dosenDewi   = User::where('email', 'dewi.lestari@sijamu.com')->first();
        $dosenEko    = User::where('email', 'eko.prasetyo@sijamu.com')->first();
        $dosenRatna  = User::where('email', 'ratna.sari@sijamu.com')->first();
        $adminUser   = User::where('email', 'mastyo@sijamu.com')->first();

        $defaultUser = $dosenHendra ?: $adminUser;

        $courses = [
            // Teknik Informatika
            [
                'code' => 'TIF101',
                'name' => 'Algoritma & Pemrograman',
                'credits' => 3,
                'semester' => 1,
                'study_program_id' => $prodiTif ? $prodiTif->id : null,
                'user_id' => $dosenHendra ? $dosenHendra->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'TIF102',
                'name' => 'Struktur Data & Algoritma Lanjut',
                'credits' => 3,
                'semester' => 2,
                'study_program_id' => $prodiTif ? $prodiTif->id : null,
                'user_id' => $dosenHendra ? $dosenHendra->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'TIF201',
                'name' => 'Rekayasa Perangkat Lunak',
                'credits' => 3,
                'semester' => 3,
                'study_program_id' => $prodiTif ? $prodiTif->id : null,
                'user_id' => $dosenEko ? $dosenEko->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'TIF202',
                'name' => 'Pemrograman Berorientasi Objek',
                'credits' => 3,
                'semester' => 3,
                'study_program_id' => $prodiTif ? $prodiTif->id : null,
                'user_id' => $dosenHendra ? $dosenHendra->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'TIF301',
                'name' => 'Sistem Basis Data Terdistribusi',
                'credits' => 3,
                'semester' => 5,
                'study_program_id' => $prodiTif ? $prodiTif->id : null,
                'user_id' => $dosenEko ? $dosenEko->id : ($defaultUser ? $defaultUser->id : null),
            ],
            // Pendidikan Matematika
            [
                'code' => 'MAT101',
                'name' => 'Kalkulus Diferensial',
                'credits' => 3,
                'semester' => 1,
                'study_program_id' => $prodiMat ? $prodiMat->id : null,
                'user_id' => $dosenDewi ? $dosenDewi->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'MAT201',
                'name' => 'Aljabar Linier Elementer',
                'credits' => 3,
                'semester' => 3,
                'study_program_id' => $prodiMat ? $prodiMat->id : null,
                'user_id' => $dosenRatna ? $dosenRatna->id : ($defaultUser ? $defaultUser->id : null),
            ],
            [
                'code' => 'MAT202',
                'name' => 'Statistika dan Probabilitas',
                'credits' => 3,
                'semester' => 3,
                'study_program_id' => $prodiMat ? $prodiMat->id : null,
                'user_id' => $dosenDewi ? $dosenDewi->id : ($defaultUser ? $defaultUser->id : null),
            ],
            // Manajemen
            [
                'code' => 'MNJ101',
                'name' => 'Pengantar Manajemen & Bisnis',
                'credits' => 3,
                'semester' => 1,
                'study_program_id' => $prodiMnj ? $prodiMnj->id : null,
                'user_id' => $defaultUser ? $defaultUser->id : null,
            ],
            // Hukum
            [
                'code' => 'HUK101',
                'name' => 'Pengantar Tata Hukum Indonesia',
                'credits' => 2,
                'semester' => 1,
                'study_program_id' => $prodiHuk ? $prodiHuk->id : null,
                'user_id' => $defaultUser ? $defaultUser->id : null,
            ],
        ];

        foreach ($courses as $courseData) {
            Course::updateOrCreate(
                ['code' => $courseData['code']],
                $courseData
            );
        }
    }
}
