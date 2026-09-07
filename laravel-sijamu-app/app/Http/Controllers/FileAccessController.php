<?php

namespace App\Http\Controllers;

use App\Models\MutuDocument;
use App\Models\RpsDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class FileAccessController extends Controller
{
    /**
     * Alirkan berkas dokumen mutu secara aman dengan verifikasi otentikasi & izin.
     */
    public function streamMutuDocument(Request $request, $id)
    {
        // 1. Verifikasi Izin Akses
        $this->authorizeDocumentAccess($request, 'mutu', $id);

        $doc = MutuDocument::findOrFail($id);

        // 2. Lokalisasi berkas fisik (prioritas disk private, fallback disk public untuk berkas lama)
        $disk = null;
        if (Storage::disk('private')->exists($doc->file_path)) {
            $disk = 'private';
        } elseif (Storage::disk('public')->exists($doc->file_path)) {
            $disk = 'public';
        }

        if (!$disk) {
            abort(404, 'Berkas dokumen mutu tidak ditemukan di penyimpanan server.');
        }

        $fullPath = Storage::disk($disk)->path($doc->file_path);
        $fileName = $doc->file_name ?: ('dokumen_mutu_' . $doc->id . '.pdf');
        $isDownload = $request->boolean('download') || $request->query('download') === '1';

        $headers = [
            'Content-Type' => 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-transform, max-age=3600',
        ];

        if ($isDownload) {
            return response()->download($fullPath, $fileName, $headers);
        }

        $headers['Content-Disposition'] = 'inline; filename="' . addslashes($fileName) . '"';
        return response()->file($fullPath, $headers);
    }

    /**
     * Alirkan berkas RPS secara aman dengan verifikasi otentikasi & izin.
     */
    public function streamRpsDocument(Request $request, $id)
    {
        // 1. Verifikasi Izin Akses
        $this->authorizeDocumentAccess($request, 'rps', $id);

        $doc = RpsDocument::findOrFail($id);

        // 2. Lokalisasi berkas fisik
        $disk = null;
        if (Storage::disk('private')->exists($doc->file_path)) {
            $disk = 'private';
        } elseif (Storage::disk('public')->exists($doc->file_path)) {
            $disk = 'public';
        }

        if (!$disk) {
            abort(404, 'Berkas RPS tidak ditemukan di penyimpanan server.');
        }

        $fullPath = Storage::disk($disk)->path($doc->file_path);
        $fileName = $doc->file_name ?: ('rps_dokumen_' . $doc->id . '.pdf');
        $isDownload = $request->boolean('download') || $request->query('download') === '1';

        $headers = [
            'Content-Type' => 'application/pdf',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-transform, max-age=3600',
        ];

        if ($isDownload) {
            return response()->download($fullPath, $fileName, $headers);
        }

        $headers['Content-Disposition'] = 'inline; filename="' . addslashes($fileName) . '"';
        return response()->file($fullPath, $headers);
    }

    /**
     * Validasi hak akses pengguna atau verifikasi URL bertanda tangan sah.
     */
    protected function authorizeDocumentAccess(Request $request, string $type, $docId): void
    {
        // Akses via Temporary Signed URL (untuk auditor eksternal / peninjau luar)
        if ($request->hasValidSignature()) {
            return;
        }

        // Akses berbasis sesi pengguna yang terautentikasi
        $user = $request->user();
        if (!$user) {
            abort(401, 'Silakan login terlebih dahulu untuk mengakses dokumen ini.');
        }

        // Administrator memiliki hak akses penuh
        if ($user->role === 'admin') {
            return;
        }

        // Role permissions check
        $rolePerm = \App\Models\RolePermission::where('role', $user->role)->first();
        $userPermissions = $rolePerm ? ($rolePerm->permissions ?? []) : [];

        if (empty($userPermissions)) {
            $defaults = [
                'auditor'   => ['view_dashboard', 'view_report', 'start_evaluation', 'view_rps'],
                'dekan'     => ['view_dashboard', 'view_report', 'view_rps'],
                'koprodi'   => ['view_dashboard', 'view_report', 'upload_document', 'view_rps', 'manage_rps'],
                'taskforce' => ['upload_document', 'view_rps', 'manage_rps'],
                'dosen'     => ['view_dashboard', 'view_rps'],
            ];
            $userPermissions = $defaults[$user->role] ?? [];
        }

        if ($type === 'mutu') {
            $allowedPerms = ['view_dashboard', 'view_report', 'upload_document', 'start_evaluation'];
            if (empty(array_intersect($allowedPerms, $userPermissions))) {
                abort(403, 'Anda tidak memiliki izin untuk melihat dokumen mutu.');
            }
        } elseif ($type === 'rps') {
            if (!in_array('view_rps', $userPermissions)) {
                abort(403, 'Anda tidak memiliki izin untuk melihat dokumen RPS.');
            }
        }
    }
}
