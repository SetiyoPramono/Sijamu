<?php

namespace App\Http\Controllers;

use App\Models\RpsDocument;
use App\Models\Course;
use App\Http\Requests\StoreRpsDocumentRequest;
use App\Services\DocumentUploadService;
use Exception;

class RpsController extends Controller
{
    /**
     * Upload an RPS file for a given course.
     */
    public function upload(StoreRpsDocumentRequest $request, DocumentUploadService $service)
    {
        $file = $request->file('file');
        $course = Course::findOrFail($request->input('course_id'));
        $user = auth()->user();

        try {
            $doc = $service->uploadRps($course, $file, $user);

            return response()->json([
                'id'         => $doc->id,
                'name'       => $file->getClientOriginalName(),
                'size'       => $file->getSize(),
                'url'        => route('documents.rps.show', ['id' => $doc->id]),
                'uploadedAt' => $doc->created_at->toISOString(),
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    /**
     * Delete an RPS file by document ID.
     */
    public function destroy($id, DocumentUploadService $service)
    {
        $doc = RpsDocument::findOrFail($id);
        $user = auth()->user();

        try {
            $service->deleteRps($doc, $user);
            return response()->json(['message' => 'Deleted']);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }
}
