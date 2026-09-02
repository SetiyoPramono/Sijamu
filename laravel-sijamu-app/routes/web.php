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

    // Endpoint Profil Mandiri
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'updateIdentity'])->name('profile.update');
    Route::patch('/profile/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.password');

    // Endpoint API untuk Laporan
    Route::middleware('permission:view_report')->group(function () {
        Route::get('/api/reports/logs', [\App\Http\Controllers\ReportController::class, 'getLogs']);
        Route::get('/api/reports/download/led', [\App\Http\Controllers\ReportController::class, 'downloadLed']);
        Route::get('/api/reports/download/lkps', [\App\Http\Controllers\ReportController::class, 'downloadLkps']);
        Route::get('/api/reports/download/kelengkapan', [\App\Http\Controllers\ReportController::class, 'downloadKelengkapan']);
        Route::get('/api/reports/download/temuan-audit', [\App\Http\Controllers\ReportController::class, 'downloadTemuanAudit']);
    });

    Route::prefix('admin')->group(function() {
        Route::get('/periods', function () {
            return Inertia::render('Sijamu/admin/periods/page');
        })->middleware('permission:manage_periods');

        Route::get('/rps', function () {
            return Inertia::render('Sijamu/admin/rps/page');
        })->middleware('permission:manage_rps');

        Route::middleware('permission:manage_rps')->group(function () {
            Route::post('/api/courses', [\App\Http\Controllers\CourseController::class, 'store']);
            Route::put('/api/courses/{id}', [\App\Http\Controllers\CourseController::class, 'update']);
            Route::delete('/api/courses/{id}', [\App\Http\Controllers\CourseController::class, 'destroy']);
        });
        
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

        // Upload Config API endpoints
        Route::get('/api/prodis', [\App\Http\Controllers\UploadConfigController::class, 'getProdis']);
        Route::get('/api/docs', [\App\Http\Controllers\UploadConfigController::class, 'getDocs']);

        // Users API
        Route::get('/api/users', function() {
            return response()->json(\App\Models\User::select('id', 'name', 'email', 'role')->get());
        });

        // Course API endpoints
        Route::get('/api/courses', [\App\Http\Controllers\CourseController::class, 'index']);

        Route::get('/api/categories', [\App\Http\Controllers\UploadConfigController::class, 'getCategories']);

        Route::middleware('permission:manage_upload')->group(function() {
            Route::post('/api/categories', [\App\Http\Controllers\UploadConfigController::class, 'storeCategory']);
            Route::put('/api/categories/{id}', [\App\Http\Controllers\UploadConfigController::class, 'updateCategory']);
            Route::delete('/api/categories/{id}', [\App\Http\Controllers\UploadConfigController::class, 'destroyCategory']);

            Route::post('/api/prodis', [\App\Http\Controllers\UploadConfigController::class, 'storeProdi']);
            Route::put('/api/prodis/{id}', [\App\Http\Controllers\UploadConfigController::class, 'updateProdi']);
            Route::delete('/api/prodis/{id}', [\App\Http\Controllers\UploadConfigController::class, 'destroyProdi']);

            Route::post('/api/docs', [\App\Http\Controllers\UploadConfigController::class, 'storeDoc']);
            Route::put('/api/docs/{id}', [\App\Http\Controllers\UploadConfigController::class, 'updateDoc']);
            Route::delete('/api/docs/{id}', [\App\Http\Controllers\UploadConfigController::class, 'destroyDoc']);

            Route::post('/api/docs/{docId}/criteria', [\App\Http\Controllers\UploadConfigController::class, 'storeCriteria']);
            Route::put('/api/docs/{docId}/criteria/{id}', [\App\Http\Controllers\UploadConfigController::class, 'updateCriteria']);
            Route::delete('/api/docs/{docId}/criteria/{id}', [\App\Http\Controllers\UploadConfigController::class, 'destroyCriteria']);
        });

        // RPS file upload/delete — accessible to all authenticated users (own RPS)
        Route::post('/api/rps/upload', [\App\Http\Controllers\RpsController::class, 'upload']);
        Route::delete('/api/rps/{id}', [\App\Http\Controllers\RpsController::class, 'destroy']);
    });

    // Mutu Documents API endpoints
    Route::get('/api/mutu-documents', [\App\Http\Controllers\MutuDocumentController::class, 'index']);
    Route::post('/api/mutu-documents', [\App\Http\Controllers\MutuDocumentController::class, 'store'])->middleware('permission:upload_document');
    Route::delete('/api/mutu-documents/{id}', [\App\Http\Controllers\MutuDocumentController::class, 'destroy']);
});

require __DIR__.'/auth.php';
