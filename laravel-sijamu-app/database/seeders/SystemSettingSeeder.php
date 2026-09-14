<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Profil Institusi
            ['key' => 'institution_name', 'value' => 'Universitas PGRI Banyuwangi', 'type' => 'string'],
            ['key' => 'institution_slogan', 'value' => 'Unggul dalam Mutu dan Inovasi', 'type' => 'string'],
            ['key' => 'institution_logo', 'value' => '', 'type' => 'file'],
            ['key' => 'primary_color', 'value' => '#057A55', 'type' => 'string'],

            // Notifikasi & SMTP
            ['key' => 'smtp_host', 'value' => 'smtp.mailtrap.io', 'type' => 'string'],
            ['key' => 'smtp_port', 'value' => '2525', 'type' => 'string'],
            ['key' => 'smtp_user', 'value' => '', 'type' => 'string'],
            ['key' => 'smtp_pass', 'value' => '', 'type' => 'string'],
            ['key' => 'smtp_encryption', 'value' => 'tls', 'type' => 'string'],
            ['key' => 'enable_email_notif', 'value' => '1', 'type' => 'boolean'],
            ['key' => 'wa_api_endpoint', 'value' => '', 'type' => 'string'],
            ['key' => 'wa_api_key', 'value' => '', 'type' => 'string'],

            // Preferensi Mutu
            ['key' => 'passing_grade_safe', 'value' => '80', 'type' => 'number'],
            ['key' => 'passing_grade_critical', 'value' => '50', 'type' => 'number'],
            ['key' => 'lpm_head_name', 'value' => 'Dr. Budi Santoso, M.Pd.', 'type' => 'string'],
            ['key' => 'lpm_head_nip', 'value' => '198001012005011003', 'type' => 'string'],

            // Keamanan & Sistem
            ['key' => 'max_upload_size_mb', 'value' => '10', 'type' => 'number'],
            ['key' => 'maintenance_mode', 'value' => '0', 'type' => 'boolean'],
        ];

        foreach ($settings as $setting) {
            \App\Models\SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'], 'type' => $setting['type']]
            );
        }
    }
}
