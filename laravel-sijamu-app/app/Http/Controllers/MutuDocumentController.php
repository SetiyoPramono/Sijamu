<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MutuDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\MutuDocument::with(['studyProgram', 'documentIndicator', 'user']);
        
        if ($request->has('study_program_id')) {
            $query->where('study_program_id', $request->study_program_id);
        }

        $documents = $query->get()->map(function ($doc) {
            return [
                'id' => $doc->id,
                'prodiId' => $doc->study_program_id,
                'prodi' => $doc->studyProgram ? $doc->studyProgram->name : 'Unknown',
                'indicatorId' => $doc->document_indicator_id,
                'file' => [
                    'name' => $doc->file_name,
                    'size' => $doc->file_size,
                    'type' => $doc->file_type,
                    'url' => \Illuminate\Support\Facades\Storage::url($doc->file_path),
                ],
                'uploader' => $doc->user ? $doc->user->name : null,
                'created_at' => $doc->created_at,
            ];
        });

        return response()->json($documents);
    }

    public function store(Request $request)
    {
        $request->validate([
            'study_program_id' => 'required|exists:study_programs,id',
            'document_indicator_id' => 'required|exists:document_indicators,id',
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB
        ]);

        $file = $request->file('file');
        $path = $file->store("mutu/{$request->study_program_id}", 'public');

        $document = \App\Models\MutuDocument::create([
            'study_program_id' => $request->study_program_id,
            'document_indicator_id' => $request->document_indicator_id,
            'user_id' => $request->user()->id ?? 1, // Fallback to 1 if no user (e.g. testing)
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
        ]);

        $document->load('studyProgram');

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => [
                'id' => $document->id,
                'prodiId' => $document->study_program_id,
                'prodi' => $document->studyProgram ? $document->studyProgram->name : 'Unknown',
                'indicatorId' => $document->document_indicator_id,
                'file' => [
                    'name' => $document->file_name,
                    'size' => $document->file_size,
                    'type' => $document->file_type,
                    'url' => \Illuminate\Support\Facades\Storage::url($document->file_path),
                ],
                'uploader' => $request->user()->name ?? 'Unknown',
                'created_at' => $document->created_at,
            ]
        ]);
    }

    public function destroy($id)
    {
        $document = \App\Models\MutuDocument::findOrFail($id);
        $user = auth()->user();

        // Validasi wewenang hapus: Admin atau pemilik/pengunggah file
        if ($user->role !== 'admin' && $document->user_id !== $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki wewenang untuk menghapus dokumen ini.'], 403);
        }
        
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
