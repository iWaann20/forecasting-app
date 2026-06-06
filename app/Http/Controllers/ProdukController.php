<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = Produk::query();

        if ($search) {
            $query->where('nama_produk', 'ilike', "%{$search}%");
        }

        $produk = $query->orderBy('nama_produk')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->produk_id,
                'nama' => $row->nama_produk,
                'stok' => $row->stok,
                'stok_minimum' => $row->stok_minimum,
            ]);

        return Inertia::render('dataproduk', [
            'produk' => $produk,
            'filters' => [
                'search' => $search,
            ],
            'canManage' => $request->user()?->role === 'pemilik',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255', 'unique:produk,nama_produk'],
            'stok' => ['required', 'integer', 'min:0'],
            'stok_minimum' => ['required', 'integer', 'min:0'],
        ]);

        Produk::create([
            'produk_id' => Str::uuid(),
            'nama_produk' => $validated['nama_produk'],
            'stok' => $validated['stok'],
            'stok_minimum' => $validated['stok_minimum'],
        ]);

        return redirect()->back();
    }

    public function update(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'nama_produk' => ['required', 'string', 'max:255', 'unique:produk,nama_produk,' . $produk->produk_id . ',produk_id'],
            'stok' => ['required', 'integer', 'min:0'],
            'stok_minimum' => ['required', 'integer', 'min:0'],
        ]);

        $produk->update($validated);

        return redirect()->back();
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();

        return redirect()->back();
    }
}
