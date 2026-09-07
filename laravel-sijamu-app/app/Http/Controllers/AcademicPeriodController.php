<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicPeriodController extends Controller
{
    /**
     * Dapatkan daftar seluruh periode akademik
     */
    public function index()
    {
        $periods = AcademicPeriod::orderBy('is_current', 'desc')
            ->orderBy('name', 'desc')
            ->orderBy('semester', 'desc')
            ->get();

        return response()->json($periods->map(function ($period) {
            return [
                'id'             => $period->id,
                'name'           => $period->name,
                'semester'       => $period->semester,
                'isCurrent'      => (bool) $period->is_current,
                'uploadDeadline' => $period->upload_deadline ? $period->upload_deadline->format('Y-m-d\TH:i') : null,
                'created_at'     => $period->created_at,
            ];
        }));
    }

    /**
     * Simpan periode akademik baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'            => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'        => ['required', 'string', 'in:Ganjil,Genap,Pendek'],
            'upload_deadline' => ['nullable', 'date'],
        ], [
            'name.regex' => 'Format tahun ajaran harus YYYY/YYYY (contoh: 2026/2027)',
        ]);

        $exists = AcademicPeriod::where('name', $validated['name'])
            ->where('semester', $validated['semester'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Periode dengan tahun ajaran dan semester ini sudah ada.'
            ], 422);
        }

        $isFirst = AcademicPeriod::count() === 0;

        $period = AcademicPeriod::create([
            'name'            => $validated['name'],
            'semester'        => $validated['semester'],
            'is_current'      => $isFirst,
            'upload_deadline' => $validated['upload_deadline'] ?? null,
        ]);

        return response()->json([
            'message' => 'Periode baru berhasil ditambahkan.',
            'period'  => [
                'id'             => $period->id,
                'name'           => $period->name,
                'semester'       => $period->semester,
                'isCurrent'      => (bool) $period->is_current,
                'uploadDeadline' => $period->upload_deadline ? $period->upload_deadline->format('Y-m-d\TH:i') : null,
                'created_at'     => $period->created_at,
            ]
        ], 201);
    }

    /**
     * Perbarui data periode akademik
     */
    public function update(Request $request, $id)
    {
        $period = AcademicPeriod::findOrFail($id);

        $validated = $request->validate([
            'name'            => ['required', 'string', 'regex:/^\d{4}\/\d{4}$/'],
            'semester'        => ['required', 'string', 'in:Ganjil,Genap,Pendek'],
            'upload_deadline' => ['nullable', 'date'],
        ], [
            'name.regex' => 'Format tahun ajaran harus YYYY/YYYY (contoh: 2026/2027)',
        ]);

        $exists = AcademicPeriod::where('name', $validated['name'])
            ->where('semester', $validated['semester'])
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Periode dengan tahun ajaran dan semester ini sudah ada.'
            ], 422);
        }

        $period->update([
            'name'            => $validated['name'],
            'semester'        => $validated['semester'],
            'upload_deadline' => $validated['upload_deadline'] ?? null,
        ]);

        return response()->json([
            'message' => 'Data periode berhasil diperbarui.',
            'period'  => [
                'id'             => $period->id,
                'name'           => $period->name,
                'semester'       => $period->semester,
                'isCurrent'      => (bool) $period->is_current,
                'uploadDeadline' => $period->upload_deadline ? $period->upload_deadline->format('Y-m-d\TH:i') : null,
                'created_at'     => $period->created_at,
            ]
        ]);
    }

    /**
     * Aktifkan periode target sebagai periode akademik berjalan
     */
    public function setActive($id)
    {
        $period = AcademicPeriod::findOrFail($id);

        DB::transaction(function () use ($period) {
            AcademicPeriod::where('id', '!=', $period->id)->update(['is_current' => false]);
            $period->update(['is_current' => true]);
        });

        return response()->json([
            'message' => 'Periode berhasil diaktifkan. Seluruh sistem akan mengacu ke periode ini.',
            'id'      => $period->id,
        ]);
    }

    /**
     * Hapus periode akademik (hanya periode arsip)
     */
    public function destroy($id)
    {
        $period = AcademicPeriod::findOrFail($id);

        if ($period->is_current) {
            return response()->json([
                'message' => 'Tidak dapat menghapus periode yang sedang aktif.'
            ], 422);
        }

        $period->delete();

        return response()->json([
            'message' => 'Periode berhasil dihapus.'
        ]);
    }
}
