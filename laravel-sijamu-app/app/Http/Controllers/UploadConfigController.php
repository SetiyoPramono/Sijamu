<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudyProgram;
use App\Models\DocumentIndicator;

class UploadConfigController extends Controller
{
    public function getProdis()
    {
        return response()->json(StudyProgram::all());
    }

    public function storeProdi(Request $request)
    {
        $request->validate(['nama' => 'required|string|unique:study_programs,name']);
        $prodi = StudyProgram::create(['name' => $request->nama]);
        return response()->json($prodi);
    }

    public function updateProdi(Request $request, $id)
    {
        $request->validate(['nama' => 'required|string|unique:study_programs,name,'.$id]);
        $prodi = StudyProgram::findOrFail($id);
        $prodi->update(['name' => $request->nama]);
        return response()->json($prodi);
    }

    public function destroyProdi($id)
    {
        StudyProgram::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function getDocs()
    {
        return response()->json(DocumentIndicator::all());
    }

    public function storeDoc(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|unique:document_indicators,kode',
            'nama' => 'required|string',
            'help' => 'nullable|string'
        ]);
        $doc = DocumentIndicator::create($request->only(['kode', 'nama', 'help']));
        return response()->json($doc);
    }

    public function updateDoc(Request $request, $id)
    {
        $request->validate([
            'kode' => 'required|string|unique:document_indicators,kode,'.$id,
            'nama' => 'required|string',
            'help' => 'nullable|string'
        ]);
        $doc = DocumentIndicator::findOrFail($id);
        $doc->update($request->only(['kode', 'nama', 'help']));
        return response()->json($doc);
    }

    public function destroyDoc($id)
    {
        DocumentIndicator::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
