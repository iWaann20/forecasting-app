<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DataPenggunaController extends Controller
{
    public function index(Request $request): Response
    {
        $roleFilter = $request->query('role');
        
        $query = Pengguna::query();

        if ($roleFilter && $roleFilter !== 'Semua') {
            $query->where('role', $roleFilter);
        }

        $pengguna = $query->orderBy('created_at', 'desc')->paginate(10)
            ->withQueryString()
            ->through(fn ($user) => [
                'id' => $user->pengguna_id,
                'username' => $user->username,
                'role' => $user->role,
                'foto_profil_url' => $user->foto_profil_url,
                'created_at' => $user->created_at ? $user->created_at->format('d M Y') : '-',
                'is_current_user' => $user->pengguna_id === $request->user()->pengguna_id,
            ]);

        return Inertia::render('datapengguna', [
            'pengguna' => $pengguna,
            'filters' => [
                'role' => $roleFilter ?? 'Semua',
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:pengguna,username'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['Admin', 'Pemilik Usaha', 'Staff'])],
        ]);

        Pengguna::create([
            'pengguna_id' => (string) Str::uuid(),
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->back();
    }

    public function updateRole(Request $request, Pengguna $pengguna): RedirectResponse
    {
        if ($request->user()->pengguna_id === $pengguna->pengguna_id) {
            return redirect()->back()->withErrors(['role' => 'Anda tidak dapat mengubah role diri sendiri.']);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['Admin', 'Pemilik Usaha', 'Staff'])],
        ]);

        $pengguna->update([
            'role' => $validated['role'],
        ]);

        return redirect()->back();
    }

    public function destroy(Request $request, Pengguna $pengguna): RedirectResponse
    {
        if ($request->user()->pengguna_id === $pengguna->pengguna_id) {
            return redirect()->back()->withErrors(['message' => 'Anda tidak dapat menghapus akun diri sendiri.']);
        }

        // Aturan: Minimal satu Admin
        if ($pengguna->role === 'Admin') {
            $adminCount = Pengguna::where('role', 'Admin')->count();
            if ($adminCount <= 1) {
                return redirect()->back()->withErrors(['message' => 'Sistem harus memiliki minimal satu akun Admin aktif.']);
            }
        }

        $pengguna->delete();

        return redirect()->back();
    }
}
