<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MutuDocument;
use App\Http\Requests\StoreMutuDocumentRequest;
use App\Services\DocumentUploadService;
use Exception;

class MutuDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = MutuDocument::with(['studyProgram', 'documentIndicator', 'user']);
        
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
                    'url' => route('documents.mutu.show', ['id' => $doc->id]),
                ],
                'uploader' => $doc->user ? $doc->user->name : null,
                'created_at' => $doc->created_at,
            ];
        });

        return response()->json($documents);
    }

    public function store(StoreMutuDocumentRequest $request, DocumentUploadService $service)
    {
        $file = $request->file('file');
        $user = $request->user();

        try {
            $document = $service->uploadMutuDocument(
                $request->study_program_id,
                $request->document_indicator_id,
                $file,
                $user
            );

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
                        'url' => route('documents.mutu.show', ['id' => $document->id]),
                    ],
                    'uploader' => $user->name ?? 'Unknown',
                    'created_at' => $document->created_at,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    public function destroy($id, DocumentUploadService $service)
    {
        $document = MutuDocument::findOrFail($id);
        $user = auth()->user();

        try {
            $service->deleteMutuDocument($document, $user);
            return response()->json(['message' => 'Document deleted successfully']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }
}
