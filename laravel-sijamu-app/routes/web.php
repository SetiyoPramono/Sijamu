<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/debug-user', function () {
    $user = \App\Models\User::where('role', 'auditor')->first();
    if (!$user) return 'No auditor user';
    $userData = $user->toArray();
    $rolePerm = \App\Models\RolePermission::where('role', $user->role)->first();
    $userData['permissions'] = $rolePerm ? $rolePerm->permissions : 'No role perm';
    return response()->json($userData);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Sijamu/dashboard/page');
    })->name('dashboard')->middleware('permission:view_dashboard');

    Route::get('/auditor', function () {
        return Inertia::render('Sijamu/auditor/page');
    })->middleware('permission:start_evaluation');

    Route::get('/upload', function () {
        return Inertia::render('Sijamu/upload/page');
    })->middleware('permission:upload_document');

    Route::get('/rps', function () {
        return Inertia::render('Sijamu/rps/page');
    })->middleware('permission:view_rps');

    Route::get('/reports', function () {
        return Inertia::render('Sijamu/reports/page');
    })->middleware('permission:view_report');

    Route::prefix('admin')->group(function() {
        Route::get('/rps', function () {
            return Inertia::render('Sijamu/admin/rps/page');
        })->middleware('permission:manage_rps');
        
        // Grup route manajemen pengguna dengan middleware permission:manage_users
        Route::middleware('permission:manage_users')->group(function () {
            Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('admin.users.index');
            Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('admin.users.store');
            Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('admin.users.update');
            Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('admin.users.destroy');
        });
        
        // Endpoint API untuk perbarui permission juga dibatasi untuk yang bisa manage_roles atau manage_users
        // Karena halaman user terhubung dengan izin ini.
        Route::post('/permissions', [\App\Http\Controllers\RolePermissionController::class, 'store'])
            ->name('admin.permissions.store')
            ->middleware('permission:manage_users');
            
        Route::get('/settings', function () {
            return Inertia::render('Sijamu/admin/settings/page');
        })->middleware('permission:system_settings');
        
        Route::get('/upload', function () {
            return Inertia::render('Sijamu/admin/upload/page');
        })->middleware('permission:manage_upload');
    });
});

require __DIR__.'/auth.php';
