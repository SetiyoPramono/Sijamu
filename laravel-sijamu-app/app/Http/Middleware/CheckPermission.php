<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403, 'Akses ditolak.');
        }

        // Administrator memiliki semua hak akses
        if ($user->role === 'admin') {
            return $next($request);
        }

        $rolePerm = \App\Models\RolePermission::where('role', $user->role)->first();
        
        if ($rolePerm) {
            $permissions = $rolePerm->permissions ?? [];
        } else {
            // Default izin jika belum diatur di database
            $defaults = [
                'auditor' => ['view_dashboard', 'view_report', 'start_evaluation', 'view_rps'],
                'dekan' => ['view_dashboard', 'view_report', 'view_rps'],
                'koprodi' => ['view_dashboard', 'view_report', 'upload_document', 'view_rps', 'manage_rps'],
                'taskforce' => ['upload_document', 'view_rps', 'manage_rps'],
                'dosen' => ['view_dashboard', 'view_rps'],
            ];
            $permissions = $defaults[$user->role] ?? [];
        }

        if (!in_array($permission, $permissions)) {
            abort(403, 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}
