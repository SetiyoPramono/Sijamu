<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReportLog;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Dapatkan riwayat pembuatan laporan
     */
    public function getLogs(Request $request)
    {
        $logs = ReportLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'waktu' => $log->created_at->translatedFormat('d M Y, H:i'),
                    'report_type' => $log->report_type,
                    'prodi_name' => $log->prodi_name,
                    'dibuat_oleh' => $log->user ? $log->user->name : 'Sistem',
                    'status' => $log->status,
                ];
            });
            
        return response()->json($logs);
    }

    /**
     * Download Laporan Evaluasi Diri (LED) - Contoh
     */
    public function downloadLed(Request $request)
    {
        $prodi = $request->query('prodi', 'Semua Prodi');
        $tahun = $request->query('tahun', '2026');
        
        $this->logReport('Laporan Evaluasi Diri (LED)', $prodi, $request->user());
        
        $data = [
            'title' => 'Laporan Evaluasi Diri (LED)',
            'prodi' => $prodi,
            'tahun' => $tahun,
            'date' => now()->translatedFormat('d F Y')
        ];
        
        // Buat mock HTML karena belum ada view terpisah
        $html = "<h1>{$data['title']}</h1><p>Program Studi: {$data['prodi']}</p><p>Tahun: {$data['tahun']}</p><p>Data laporan evaluasi diri diringkas di sini...</p>";
        
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('LED_'.$prodi.'_'.$tahun.'.pdf');
    }

    /**
     * Download Laporan Kinerja Program Studi (LKPS)
     */
    public function downloadLkps(Request $request)
    {
        $prodi = $request->query('prodi', 'Semua Prodi');
        $tahun = $request->query('tahun', '2026');
        
        $this->logReport('Laporan Kinerja Program Studi (LKPS)', $prodi, $request->user());
        
        $html = "<h1>Laporan Kinerja Program Studi (LKPS)</h1><p>Program Studi: {$prodi}</p><p>Tahun: {$tahun}</p><p>Data kinerja kuantitatif...</p>";
        
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('LKPS_'.$prodi.'_'.$tahun.'.pdf');
    }

    /**
     * Download Rekap Kelengkapan
     */
    public function downloadKelengkapan(Request $request)
    {
        $prodi = $request->query('prodi', 'Semua Prodi');
        $tahun = $request->query('tahun', '2026');
        
        $this->logReport('Rekap Kelengkapan Dokumen', $prodi, $request->user());
        
        $html = "<h1>Rekap Kelengkapan Dokumen</h1><p>Program Studi: {$prodi}</p><p>Tahun: {$tahun}</p><p>Rincian kelengkapan dokumen Mutu dan RPS...</p>";
        
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('Kelengkapan_'.$prodi.'_'.$tahun.'.pdf');
    }

    /**
     * Download Laporan Temuan Audit
     */
    public function downloadTemuanAudit(Request $request)
    {
        $prodi = $request->query('prodi', 'Semua Prodi');
        $tahun = $request->query('tahun', '2026');
        
        $this->logReport('Laporan Temuan Audit', $prodi, $request->user());
        
        $html = "<h1>Laporan Temuan Audit</h1><p>Program Studi: {$prodi}</p><p>Tahun: {$tahun}</p><p>Catatan dan rekomendasi dari auditor...</p>";
        
        $pdf = Pdf::loadHTML($html);
        return $pdf->download('TemuanAudit_'.$prodi.'_'.$tahun.'.pdf');
    }

    /**
     * Helper mencatat ke database
     */
    private function logReport($type, $prodi, $user)
    {
        ReportLog::create([
            'user_id' => $user ? $user->id : null,
            'report_type' => $type,
            'prodi_name' => $prodi,
            'status' => 'Selesai'
        ]);
    }
}
