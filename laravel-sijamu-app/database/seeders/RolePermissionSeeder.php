<?php

namespace Database\Seeders;

use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'admin' => [
                'view_dashboard',
                'view_report',
                'start_evaluation',
                'upload_document',
                'view_rps',
                'manage_rps',
                'manage_users',
                'manage_upload',
                'manage_periods',
                'system_settings',
            ],
            'auditor' => [
                'view_dashboard',
                'view_report',
                'start_evaluation',
                'view_rps',
            ],
            'dekan' => [
                'view_dashboard',
                'view_report',
                'view_rps',
            ],
            'koprodi' => [
                'view_dashboard',
                'view_report',
                'upload_document',
                'view_rps',
                'manage_rps',
            ],
            'taskforce' => [
                'upload_document',
                'view_rps',
                'manage_rps',
            ],
            'dosen' => [
                'view_dashboard',
                'view_rps',
            ],
        ];

        foreach ($permissions as $role => $perms) {
            RolePermission::updateOrCreate(
                ['role' => $role],
                ['permissions' => $perms]
            );
        }
    }
}
