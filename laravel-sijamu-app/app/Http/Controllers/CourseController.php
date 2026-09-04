<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with(['studyProgram', 'user', 'rpsDocuments.user'])->get();
        
        // Format to match frontend expectations
        $formatted = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'code' => $course->code,
                'name' => $course->name,
                'sks' => $course->credits,
                'semester' => $course->semester,
                'dosen' => $course->user ? $course->user->name : '',
                'user_id' => $course->user_id,
                'prodi' => $course->studyProgram ? $course->studyProgram->name : '',
                'study_program_id' => $course->study_program_id,
                'rpsFiles' => $course->rpsDocuments->map(function ($doc) {
                    return [
                        'id'         => $doc->id,
                        'name'       => $doc->file_name ?? basename($doc->file_path),
                        'size'       => $doc->file_size ?? 0,
                        'url'        => Storage::url($doc->file_path),
                        'uploadedAt' => $doc->created_at->toISOString(),
                        'status'     => $doc->status,
                        'uploader'   => $doc->user ? $doc->user->name : 'Unknown',
                    ];
                })->values()->toArray(),
            ];
        });

        return response()->json($formatted);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:courses,code',
            'name' => 'required|string',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1',
            'study_program_id' => 'required|exists:study_programs,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $course = Course::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'credits' => $validated['sks'],
            'semester' => $validated['semester'],
            'study_program_id' => $validated['study_program_id'],
            'user_id' => $validated['user_id'],
        ]);

        $course->load(['studyProgram', 'user']);

        return response()->json([
            'id' => $course->id,
            'code' => $course->code,
            'name' => $course->name,
            'sks' => $course->credits,
            'semester' => $course->semester,
            'dosen' => $course->user ? $course->user->name : '',
            'user_id' => $course->user_id,
            'prodi' => $course->studyProgram ? $course->studyProgram->name : '',
            'study_program_id' => $course->study_program_id,
            'rpsFiles' => []
        ]);
    }

    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string|unique:courses,code,'.$id,
            'name' => 'required|string',
            'sks' => 'required|integer|min:1',
            'semester' => 'required|integer|min:1',
            'study_program_id' => 'required|exists:study_programs,id',
            'user_id' => 'required|exists:users,id',
        ]);

        $course->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'credits' => $validated['sks'],
            'semester' => $validated['semester'],
            'study_program_id' => $validated['study_program_id'],
            'user_id' => $validated['user_id'],
        ]);

        $course->load(['studyProgram', 'user']);

        return response()->json([
            'id' => $course->id,
            'code' => $course->code,
            'name' => $course->name,
            'sks' => $course->credits,
            'semester' => $course->semester,
            'dosen' => $course->user ? $course->user->name : '',
            'user_id' => $course->user_id,
            'prodi' => $course->studyProgram ? $course->studyProgram->name : '',
            'study_program_id' => $course->study_program_id,
            'rpsFiles' => []
        ]);
    }

    public function destroy($id)
    {
        $course = Course::with('rpsDocuments')->findOrFail($id);

        // Hapus fisik file RPS terkait dari storage disk
        foreach ($course->rpsDocuments as $doc) {
            if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
                Storage::disk('public')->delete($doc->file_path);
            }
        }

        $course->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
