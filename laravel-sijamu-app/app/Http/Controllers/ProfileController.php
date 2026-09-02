<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Tampilkan form profil pengguna.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Sijamu/profile/page', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Perbarui identitas profil (Nama dan Email).
     */
    public function updateIdentity(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return back()->with('message', 'Informasi profil berhasil diperbarui.');
    }

    /**
     * Perbarui kata sandi.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('message', 'Kata sandi berhasil diperbarui.');
    }
}
