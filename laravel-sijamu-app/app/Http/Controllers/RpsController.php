<?php

namespace App\Http\Controllers;

use App\Models\RpsDocument;
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

        // Store the file in storage/app/public/rps/{course_id}/
        $path = $file->store("rps/{$courseId}", 'public');

        // Record the file in the database
        $doc = RpsDocument::create([
            'course_id'   => $courseId,
            'user_id'     => auth()->id(),
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

        // Delete the physical file from storage
        Storage::disk('public')->delete($doc->file_path);

        // Delete the database record
        $doc->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
