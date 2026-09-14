<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SystemSettingController extends Controller
{
    public function getSettings()
    {
        $settings = SystemSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $settings = $request->except(['_token']);
        
        foreach ($settings as $key => $value) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json(['message' => 'Pengaturan berhasil disimpan.']);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            
            // Generate unique filename to break cache
            $filename = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store in public disk so it's accessible directly
            $path = $file->storeAs('settings', $filename, 'public');
            
            $logoUrl = '/storage/' . $path;

            // Delete old logo if exists
            $oldSetting = SystemSetting::where('key', 'institution_logo')->first();
            if ($oldSetting && $oldSetting->value) {
                $oldPath = str_replace('/storage/', '', $oldSetting->value);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            SystemSetting::updateOrCreate(
                ['key' => 'institution_logo'],
                ['value' => $logoUrl]
            );

            return response()->json([
                'message' => 'Logo berhasil diunggah.',
                'url' => $logoUrl
            ]);
        }

        return response()->json(['message' => 'Gagal mengunggah logo.'], 400);
    }
}
