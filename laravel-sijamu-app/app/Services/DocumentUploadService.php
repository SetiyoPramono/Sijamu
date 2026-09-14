<?php

namespace App\Services;

use App\Models\RpsDocument;
use App\Models\MutuDocument;
use App\Models\Course;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Exception;

class DocumentUploadService
{
    /**
     * Upload an RPS file for a given course.
     */
    public function uploadRps(Course $course, UploadedFile $file, $user)
    {
        // Validasi wewenang unggah: Admin, Koprodi, atau Dosen pengampu mata kuliah
        if ($user->role !== 'admin' && $user->role !== 'koprodi' && $course->user_id !== $user->id) {
            throw new Exception('Anda tidak memiliki hak akses untuk mengunggah RPS pada mata kuliah ini.', 403);
        }

        // Store the file in storage/app/private/rps/{course_id}/
        $path = $file->store("rps/{$course->id}", 'private');

        // Record the file in the database
        return RpsDocument::create([
            'course_id'   => $course->id,
            'user_id'     => $user->id,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'file_path'   => $path,
            'status'      => 'pending',
            'upload_date' => now()->toDateString(),
        ]);
    }

    /**
     * Delete an RPS file.
     */
    public function deleteRps(RpsDocument $doc, $user)
    {
        // Validasi wewenang hapus: Admin atau pemilik/pengunggah file
        if ($user->role !== 'admin' && $doc->user_id !== $user->id) {
            throw new Exception('Anda tidak memiliki wewenang untuk menghapus dokumen ini.', 403);
        }

        // Delete the physical file from storage
        if (Storage::disk('private')->exists($doc->file_path)) {
            Storage::disk('private')->delete($doc->file_path);
        }
        if (Storage::disk('public')->exists($doc->file_path)) {
            Storage::disk('public')->delete($doc->file_path);
        }

        // Delete the database record
        $doc->delete();
    }

    /**
     * Upload a Mutu document.
     */
    public function uploadMutuDocument($studyProgramId, $indicatorId, UploadedFile $file, $user)
    {
        // Store the file
        $path = $file->store("mutu/{$studyProgramId}", 'private');

        // Record the file in the database
        $document = MutuDocument::create([
            'study_program_id' => $studyProgramId,
            'document_indicator_id' => $indicatorId,
            'user_id' => $user->id ?? 1, // Fallback to 1 if no user
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
        ]);

        $document->load('studyProgram');

        return $document;
    }

    /**
     * Delete a Mutu document.
     */
    public function deleteMutuDocument(MutuDocument $document, $user)
    {
        // Validasi wewenang hapus: Admin atau pemilik/pengunggah file
        if ($user->role !== 'admin' && $document->user_id !== $user->id) {
            throw new Exception('Anda tidak memiliki wewenang untuk menghapus dokumen ini.', 403);
        }

        // Delete the physical file from storage
        if (Storage::disk('private')->exists($document->file_path)) {
            Storage::disk('private')->delete($document->file_path);
        }
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();
    }
}
