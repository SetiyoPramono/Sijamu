<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SystemSetting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $maintenanceMode = SystemSetting::where('key', 'maintenance_mode')->value('value');
        
        if ($maintenanceMode === '1') {
            $user = auth()->user();
            
            // Jika pengguna bukan admin, block akses.
            if (!$user || $user->role !== 'admin') {
                // Untuk request JSON/API, kembalikan 503 response
                if ($request->wantsJson()) {
                    return response()->json([
                        'message' => 'Sistem sedang dalam mode pemeliharaan (Maintenance).'
                    ], 503);
                }
                
                // Untuk request biasa, tampilkan halaman maintenance cantik
                return response()->view('errors.maintenance', [], 503);
            }
        }

        return $next($request);
    }
}
