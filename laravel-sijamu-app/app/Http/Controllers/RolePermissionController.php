<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RolePermission;

class RolePermissionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string|max:255',
            'permissions' => 'array',
        ]);

        RolePermission::updateOrCreate(
            ['role' => $validated['role']],
            ['permissions' => $validated['permissions']]
        );

        return redirect()->back()->with('message', 'Pengaturan izin berhasil disimpan.');
    }
}
