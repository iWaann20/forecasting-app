<?php

namespace Database\Seeders;

use App\Models\Pengguna;
use App\Models\Produk;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Pengguna
        Pengguna::create([
            'pengguna_id' => Str::uuid(),
            'username' => 'Admin',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        Pengguna::create([
            'pengguna_id' => Str::uuid(),
            'username' => 'Pemilik Usaha',
            'password' => Hash::make('password'),
            'role' => 'Pemilik Usaha',
        ]);

        Pengguna::create([
            'pengguna_id' => Str::uuid(),
            'username' => 'Staff',
            'password' => Hash::make('password'),
            'role' => 'Staff',
        ]);

        // Seed Produk
        $produkData = [
            ['nama_produk' => 'tandon_air', 'stok_minimum' => 5],
            ['nama_produk' => 'turbin_ventilator', 'stok_minimum' => 10],
            ['nama_produk' => 'genteng_metal', 'stok_minimum' => 20],
        ];

        foreach ($produkData as $produk) {
            Produk::create([
                'produk_id' => Str::uuid(),
                'nama_produk' => $produk['nama_produk'],
                'stok' => 50,
                'stok_minimum' => $produk['stok_minimum'],
            ]);
        }
    }
}

