<?php

namespace Database\Seeders;

use App\Models\User;
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
            'email' => 'mastyo@sijamu.com',
            'identity_number' => 'MasTyo',
            'password' => Hash::make('jackcin'),
            'role' => 'admin',
        ]);

        $this->call([
            RolePermissionSeeder::class,
            UploadConfigSeeder::class,
            AcademicPeriodSeeder::class,
            CourseSeeder::class,
            ReportLogSeeder::class,
        ]);
    }
}
