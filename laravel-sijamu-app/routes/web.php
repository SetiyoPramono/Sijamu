<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Sijamu/page');
});

Route::get('/dashboard', function () {
    return Inertia::render('Sijamu/dashboard/page');
});

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
    Route::get('/users', function () {
        return Inertia::render('Sijamu/admin/users/page');
    });
    Route::get('/settings', function () {
        return Inertia::render('Sijamu/admin/settings/page');
    });
    Route::get('/upload', function () {
        return Inertia::render('Sijamu/admin/upload/page');
    });
});

require __DIR__.'/auth.php';
