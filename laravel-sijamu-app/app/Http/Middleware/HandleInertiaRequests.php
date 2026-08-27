<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userData = null;
        if ($request->user()) {
            $user = $request->user();
            $userData = $user->toArray();
            
            if ($user->role === 'admin') {
                $userData['permissions'] = ['*'];
            } else {
                $rolePerm = \App\Models\RolePermission::where('role', $user->role)->first();
                if ($rolePerm) {
                    $userData['permissions'] = $rolePerm->permissions ?? [];
                } else {
                    $defaults = [
                        'auditor' => ['view_dashboard', 'view_report', 'start_evaluation', 'view_rps'],
                        'dekan' => ['view_dashboard', 'view_report', 'view_rps'],
                        'koprodi' => ['view_dashboard', 'view_report', 'upload_document', 'view_rps', 'manage_rps'],
                        'taskforce' => ['upload_document', 'view_rps', 'manage_rps'],
                        'dosen' => ['view_dashboard', 'view_rps'],
                    ];
                    $userData['permissions'] = $defaults[$user->role] ?? [];
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
        ];
    }
}
