<?php

namespace App\Http\Controllers;

use App\Models\RpsDocument;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RpsController extends Controller
{
    /**
     * Upload an RPS file for a given course.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'file' => 'required|file|mimes:pdf|max:20480', // Max 20MB
        ]);

        $file = $request->file('file');
        $courseId = $request->input('course_id');
        $course = Course::findOrFail($courseId);
        $user = auth()->user();

        // Validasi wewenang unggah: Admin, Koprodi, atau Dosen pengampu mata kuliah
        if ($user->role !== 'admin' && $user->role !== 'koprodi' && $course->user_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses untuk mengunggah RPS pada mata kuliah ini.'], 403);
        }

        // Store the file in storage/app/public/rps/{course_id}/
        $path = $file->store("rps/{$courseId}", 'public');

        // Record the file in the database
        $doc = RpsDocument::create([
            'course_id'   => $courseId,
            'user_id'     => $user->id,
            'file_name'   => $file->getClientOriginalName(),
            'file_size'   => $file->getSize(),
            'file_path'   => $path,
            'status'      => 'pending',
            'upload_date' => now()->toDateString(),
        ]);

        return response()->json([
            'id'         => $doc->id,
            'name'       => $file->getClientOriginalName(),
            'size'       => $file->getSize(),
            'url'        => Storage::url($path),
            'uploadedAt' => $doc->created_at->toISOString(),
        ]);
    }

    /**
     * Delete an RPS file by document ID.
     */
    public function destroy($id)
    {
        $doc = RpsDocument::findOrFail($id);
        $user = auth()->user();

        // Validasi wewenang hapus: Admin atau pemilik/pengunggah file
        if ($user->role !== 'admin' && $doc->user_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki wewenang untuk menghapus dokumen ini.'], 403);
        }

        // Delete the physical file from storage
        Storage::disk('public')->delete($doc->file_path);

        // Delete the database record
        $doc->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
