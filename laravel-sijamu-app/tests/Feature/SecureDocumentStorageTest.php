<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\DocumentIndicator;
use App\Models\MutuDocument;
use App\Models\RpsDocument;
use App\Models\StudyProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class SecureDocumentStorageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
        Storage::fake('public');
    }

    public function test_unauthenticated_user_cannot_access_mutu_document(): void
    {
        $response = $this->get('/documents/mutu/1/file');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_access_rps_document(): void
    {
        $response = $this->get('/documents/rps/1/file');
        $response->assertStatus(401);
    }

    public function test_mutu_document_upload_stores_to_private_disk(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $prodi = StudyProgram::create(['name' => 'Teknik Informatika']);
        $indicator = DocumentIndicator::create(['kode' => 'C1.1', 'nama' => 'VMTS']);

        $pdfFile = UploadedFile::fake()->create('dokumen_akreditasi.pdf', 500, 'application/pdf');

        $response = $this->actingAs($admin)->postJson('/api/mutu-documents', [
            'study_program_id' => $prodi->id,
            'document_indicator_id' => $indicator->id,
            'file' => $pdfFile,
        ]);

        $response->assertStatus(200);
        $docId = $response->json('document.id');
        $url = $response->json('document.file.url');

        $this->assertStringContainsString("/documents/mutu/{$docId}/file", $url);

        $doc = MutuDocument::find($docId);
        $this->assertNotNull($doc);

        // Verifikasi berkas disimpan di disk private
        Storage::disk('private')->assertExists($doc->file_path);
        // Dan TIDAK disimpan di disk public
        Storage::disk('public')->assertMissing($doc->file_path);
    }

    public function test_authenticated_user_can_stream_mutu_document(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $prodi = StudyProgram::create(['name' => 'Teknik Informatika']);
        $indicator = DocumentIndicator::create(['kode' => 'C1.1', 'nama' => 'VMTS']);

        $filePath = 'mutu/1/test_doc.pdf';
        Storage::disk('private')->put($filePath, '%PDF-1.4 dummy content');

        $doc = MutuDocument::create([
            'study_program_id' => $prodi->id,
            'document_indicator_id' => $indicator->id,
            'user_id' => $admin->id,
            'file_name' => 'test_doc.pdf',
            'file_path' => $filePath,
            'file_size' => 1024,
            'file_type' => 'application/pdf',
        ]);

        $response = $this->actingAs($admin)->get("/documents/mutu/{$doc->id}/file");

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringContainsString('inline', $response->headers->get('Content-Disposition'));
    }

    public function test_download_parameter_forces_attachment_disposition(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $prodi = StudyProgram::create(['name' => 'Teknik Informatika']);
        $indicator = DocumentIndicator::create(['kode' => 'C1.1', 'nama' => 'VMTS']);

        $filePath = 'mutu/1/test_download.pdf';
        Storage::disk('private')->put($filePath, '%PDF-1.4 dummy content');

        $doc = MutuDocument::create([
            'study_program_id' => $prodi->id,
            'document_indicator_id' => $indicator->id,
            'user_id' => $admin->id,
            'file_name' => 'test_download.pdf',
            'file_path' => $filePath,
            'file_size' => 1024,
            'file_type' => 'application/pdf',
        ]);

        $response = $this->actingAs($admin)->get("/documents/mutu/{$doc->id}/file?download=1");

        $response->assertStatus(200);
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
    }

    public function test_valid_signed_url_allows_access_without_login_session(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $prodi = StudyProgram::create(['name' => 'Teknik Informatika']);
        $indicator = DocumentIndicator::create(['kode' => 'C1.1', 'nama' => 'VMTS']);

        $filePath = 'mutu/1/signed_test.pdf';
        Storage::disk('private')->put($filePath, '%PDF-1.4 dummy content');

        $doc = MutuDocument::create([
            'study_program_id' => $prodi->id,
            'document_indicator_id' => $indicator->id,
            'user_id' => $admin->id,
            'file_name' => 'signed_test.pdf',
            'file_path' => $filePath,
            'file_size' => 1024,
            'file_type' => 'application/pdf',
        ]);

        $signedUrl = URL::temporarySignedRoute(
            'documents.mutu.show',
            now()->addHour(),
            ['id' => $doc->id]
        );

        // Akses tanpa actingAs (tamu / auditor luar)
        $response = $this->get($signedUrl);
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_rps_upload_stores_to_private_disk(): void
    {
        $dosen = User::factory()->create(['role' => 'dosen']);
        $prodi = StudyProgram::create(['name' => 'Teknik Informatika']);
        $course = Course::create([
            'code' => 'TIF101',
            'name' => 'Pemrograman Dasar',
            'credits' => 3,
            'semester' => 1,
            'study_program_id' => $prodi->id,
            'user_id' => $dosen->id,
        ]);

        $pdfFile = UploadedFile::fake()->create('rps_tif101.pdf', 500, 'application/pdf');

        $response = $this->actingAs($dosen)->postJson('/admin/api/rps/upload', [
            'course_id' => $course->id,
            'file' => $pdfFile,
        ]);

        $response->assertStatus(200);
        $docId = $response->json('id');
        $url = $response->json('url');

        $this->assertStringContainsString("/documents/rps/{$docId}/file", $url);

        $doc = RpsDocument::find($docId);
        $this->assertNotNull($doc);

        Storage::disk('private')->assertExists($doc->file_path);
        Storage::disk('public')->assertMissing($doc->file_path);
    }
}
