<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Sijamu/dashboard/page');
    })->name('dashboard');

    Route::get('/auditor', function () {
        return Inertia::render('Sijamu/auditor/page');
    });

    Route::get('/upload', function () {
        return Inertia::render('Sijamu/upload/page');
    });

    Route::get('/rps', function () {
        return Inertia::render('Sijamu/rps/page');
    });

    Route::get('/reports', function () {
        return Inertia::render('Sijamu/reports/page');
    });

    Route::prefix('admin')->group(function() {
        Route::get('/rps', function () {
            return Inertia::render('Sijamu/admin/rps/page');
        });
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('admin.users.index');
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('admin.users.store');
        Route::put('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('admin.users.destroy');
        
        Route::post('/permissions', [\App\Http\Controllers\RolePermissionController::class, 'store'])->name('admin.permissions.store');
        Route::get('/settings', function () {
            return Inertia::render('Sijamu/admin/settings/page');
        });
        Route::get('/upload', function () {
            return Inertia::render('Sijamu/admin/upload/page');
        });
    });
});

require __DIR__.'/auth.php';
