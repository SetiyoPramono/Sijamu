<?php

namespace Tests\Feature;

use App\Models\AcademicPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicPeriodApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_periods_api(): void
    {
        $response = $this->getJson('/admin/api/periods');
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_list_periods(): void
    {
        $user = User::factory()->create(['role' => 'dosen']);

        AcademicPeriod::create([
            'name' => '2025/2026',
            'semester' => 'Genap',
            'is_current' => false,
        ]);

        AcademicPeriod::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'is_current' => true,
            'upload_deadline' => '2026-10-15 23:59:00',
        ]);

        $response = $this->actingAs($user)->getJson('/admin/api/periods');

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        // Ensure active period comes first as defined in controller order
        $data = $response->json();
        $this->assertTrue($data[0]['isCurrent']);
        $this->assertEquals('2026/2027', $data[0]['name']);
        $this->assertNotNull($data[0]['uploadDeadline']);
    }

    public function test_admin_can_create_new_academic_period(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $payload = [
            'name' => '2026/2027',
            'semester' => 'Genap',
            'upload_deadline' => '2027-02-28T23:59:00',
        ];

        $response = $this->actingAs($admin)->postJson('/admin/api/periods', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Periode baru berhasil ditambahkan.',
            'period' => [
                'name' => '2026/2027',
                'semester' => 'Genap',
            ],
        ]);

        $this->assertDatabaseHas('academic_periods', [
            'name' => '2026/2027',
            'semester' => 'Genap',
        ]);
    }

    public function test_cannot_create_period_with_invalid_format_or_duplicate(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        AcademicPeriod::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'is_current' => true,
        ]);

        // Format tahun tidak valid
        $resInvalid = $this->actingAs($admin)->postJson('/admin/api/periods', [
            'name' => '2026-2027',
            'semester' => 'Ganjil',
        ]);
        $resInvalid->assertStatus(422);

        // Duplikat tahun + semester
        $resDuplicate = $this->actingAs($admin)->postJson('/admin/api/periods', [
            'name' => '2026/2027',
            'semester' => 'Ganjil',
        ]);
        $resDuplicate->assertStatus(422);
    }

    public function test_admin_can_update_academic_period(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $period = AcademicPeriod::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'is_current' => true,
        ]);

        $response = $this->actingAs($admin)->putJson("/admin/api/periods/{$period->id}", [
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'upload_deadline' => '2026-11-30 23:59:00',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Data periode berhasil diperbarui.',
        ]);

        $this->assertNotNull($period->fresh()->upload_deadline);
    }

    public function test_admin_can_activate_period_and_others_become_inactive(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $period1 = AcademicPeriod::create([
            'name' => '2025/2026',
            'semester' => 'Genap',
            'is_current' => true,
        ]);

        $period2 = AcademicPeriod::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'is_current' => false,
        ]);

        $response = $this->actingAs($admin)->patchJson("/admin/api/periods/{$period2->id}/activate");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Periode berhasil diaktifkan. Seluruh sistem akan mengacu ke periode ini.',
        ]);

        $this->assertFalse($period1->fresh()->is_current);
        $this->assertTrue($period2->fresh()->is_current);
    }

    public function test_cannot_delete_currently_active_period(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $activePeriod = AcademicPeriod::create([
            'name' => '2026/2027',
            'semester' => 'Ganjil',
            'is_current' => true,
        ]);

        $response = $this->actingAs($admin)->deleteJson("/admin/api/periods/{$activePeriod->id}");

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Tidak dapat menghapus periode yang sedang aktif.',
        ]);

        $this->assertDatabaseHas('academic_periods', ['id' => $activePeriod->id]);
    }

    public function test_admin_can_delete_archived_period(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $archivePeriod = AcademicPeriod::create([
            'name' => '2024/2025',
            'semester' => 'Genap',
            'is_current' => false,
        ]);

        $response = $this->actingAs($admin)->deleteJson("/admin/api/periods/{$archivePeriod->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Periode berhasil dihapus.',
        ]);

        $this->assertDatabaseMissing('academic_periods', ['id' => $archivePeriod->id]);
    }
}
