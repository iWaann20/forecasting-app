<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PenggunaController extends Controller
{
    public function updateUsername(Request $request)
    {
        $request->validate([
          'username' => 'required|string|max:255|unique:pengguna,username,' . request()->user()->pengguna_id . ',pengguna_id',
        ]);

        $user = request()->user();
        $user->update([
          'username' => $request->input('username')
        ]);

        return response()->json([
          'message' => 'Username berhasil diperbarui',
          'username' => $user->username
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
          'photo' => [
            'required',
            'image',
            'mimes:jpeg,png,jpg,svg,webp',
            'max:2048'
          ]
        ]);

        $user = request()->user();

        if ($user->foto_profil) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        $filename = 'foto-profil/' . Str::uuid() . '.' . $request->file('photo')->getClientOriginalExtension();

        $path = $request->file('photo')->storeAs(
          dirname($filename),
          basename($filename),
          'public'
        );

        $user->update([
          'foto_profil' => $path
        ]);

        return response()->json([
          'message' => 'Foto profil berhasil diperbarui',
          'foto_profil_url' => $user->foto_profil_url
        ]);
    }

    public function deleteProfile(Request $request)
    {
        $user = request()->user();

        if ($user->foto_profil) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        $user->update([
          'foto_profil' => null
        ]);

        return response()->json([
          'message' => 'Foto profil berhasil dihapus'
        ]);
    }
}