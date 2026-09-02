<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Users
        User::create([
            'name' => 'MasTyo',
            'email' => 'mastyo@sijamu.com', // Tetap butuh format email atau NIP
            'identity_number' => 'MasTyo',
            'password' => Hash::make('jackcin123'),
            'role' => 'admin',
        ]);

        // Courses
        Course::create([
            'code' => 'TIF101',
            'name' => 'Algoritma & Pemrograman',
            'credits' => 3,
            'semester' => '1',
        ]);

        Course::create([
            'code' => 'TIF201',
            'name' => 'Rekayasa Perangkat Lunak',
            'credits' => 3,
            'semester' => '3',
        ]);

        $this->call([
            UploadConfigSeeder::class,
        ]);
    }
}
