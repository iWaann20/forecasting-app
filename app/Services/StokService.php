<?php

namespace App\Services;

use App\Models\Produk;
use App\Models\Notifikasi;
use App\Models\Pengguna;
use Illuminate\Support\Str;

class StokService
{
    public static function notifyStokMinimum(Produk $produk)
    {
        // Get all users (pemilik and karyawan)
        $users = Pengguna::all();
        
        foreach ($users as $user) {
            // Check if notification already exists for this exact stock state to avoid spam
            $exists = Notifikasi::where('pengguna_id', $user->pengguna_id)
                ->where('reference_type', 'produk')
                ->where('reference_id', $produk->produk_id)
                ->where('tipe_notifikasi', 'stok_minimum')
                ->where('created_at', '>=', now()->subHours(24))
                ->exists();

            if (!$exists) {
                Notifikasi::create([
                    'notif_id' => Str::uuid(),
                    'judul' => 'Peringatan Stok',
                    'pengguna_id' => $user->pengguna_id,
                    'tipe_notifikasi' => 'stok_minimum',
                    'pesan' => "Stok {$produk->nama_produk} telah mencapai batas minimum ({$produk->stok}/{$produk->stok_minimum})",
                    'reference_type' => 'produk',
                    'reference_id' => $produk->produk_id,
                ]);
            }
        }
    }

    public static function notifyPemilikActivity(string $tipe, string $judul, string $pesan, string $referenceType, string $referenceId)
    {
        // Only notify 'pemilik' role
        $pemiliks = Pengguna::where('role', 'pemilik')->get();

        foreach ($pemiliks as $pemilik) {
            Notifikasi::create([
                'notif_id' => Str::uuid(),
                'judul' => $judul,
                'pengguna_id' => $pemilik->pengguna_id,
                'tipe_notifikasi' => $tipe,
                'pesan' => $pesan,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
            ]);
        }
    }
}
