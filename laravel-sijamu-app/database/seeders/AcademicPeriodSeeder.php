<?php

namespace Database\Seeders;

use App\Models\AcademicPeriod;
use Illuminate\Database\Seeder;

class AcademicPeriodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $periods = [
            [
                'name' => '2026/2027',
                'semester' => 'Ganjil',
                'is_current' => true,
                'upload_deadline' => '2026-10-31 23:59:00',
            ],
            [
                'name' => '2025/2026',
                'semester' => 'Genap',
                'is_current' => false,
                'upload_deadline' => '2026-03-31 23:59:00',
            ],
            [
                'name' => '2025/2026',
                'semester' => 'Ganjil',
                'is_current' => false,
                'upload_deadline' => '2025-10-31 23:59:00',
            ],
        ];

        foreach ($periods as $data) {
            AcademicPeriod::updateOrCreate(
                ['name' => $data['name'], 'semester' => $data['semester']],
                $data
            );
        }
    }
}
