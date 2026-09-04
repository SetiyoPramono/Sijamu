<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\RolePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('id', 'asc')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'nama' => $user->name,
                'nip' => $user->identity_number,
                'email' => $user->email,
                'role' => $user->role,
                'prodi' => $user->prodi ?? '',
                'status' => $user->status ?? 'aktif',
                'lastLogin' => $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i') : '-',
            ];
        });

        $permissions = RolePermission::all()->pluck('permissions', 'role')->toArray();

        return Inertia::render('Sijamu/admin/users/page', [
            'serverUsers' => $users,
            'serverPermissions' => (object)$permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => 'required|string|max:50|unique:users,identity_number',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string',
            'prodi' => 'nullable|string',
            'status' => 'required|string|in:aktif,nonaktif',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $validated['nama'],
            'identity_number' => $validated['nip'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'prodi' => $validated['prodi'],
            'status' => $validated['status'],
            'password' => $validated['password'],
        ]);

        return redirect()->back()->with('message', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nip' => ['required', 'string', 'max:50', Rule::unique('users', 'identity_number')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string',
            'prodi' => 'nullable|string',
            'status' => 'required|string|in:aktif,nonaktif',
            'password' => 'nullable|string|min:8',
        ]);

        // Proteksi self-demotion dan self-lockout
        if ($user->id === auth()->id()) {
            if ($validated['role'] !== 'admin') {
                return redirect()->back()->withErrors(['message' => 'Anda tidak dapat mengubah peran akun Anda sendiri.']);
            }
            if ($validated['status'] === 'nonaktif') {
                return redirect()->back()->withErrors(['message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.']);
            }
        }

        $user->name = $validated['nama'];
        $user->identity_number = $validated['nip'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->prodi = $validated['prodi'];
        $user->status = $validated['status'];

        if (!empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        return redirect()->back()->with('message', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === 1 || $user->id === auth()->id()) {
            return redirect()->back()->withErrors(['message' => 'Tidak dapat menghapus administrator utama atau diri sendiri.']);
        }

        $user->delete();

        return redirect()->back()->with('message', 'Pengguna berhasil dihapus.');
    }
}
