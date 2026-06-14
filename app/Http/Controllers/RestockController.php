<?php

namespace App\Http\Controllers;

use App\Models\DataRestock;
use App\Models\Produk;
use App\Services\StokService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RestockController extends Controller
{
    public function index(Request $request): Response
    {
        $produkId = $request->query('produk');
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun');
        
        $query = DataRestock::with('produk');

        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        if ($bulan) {
            $query->whereMonth('tanggal', (int) $bulan);
        }

        if ($tahun) {
            $query->whereYear('tanggal', (int) $tahun);
        }

        $restock = $query
            ->orderByDesc('tanggal')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->restock_id,
                'produk_id' => $row->produk_id,
                'tanggal' => $row->tanggal?->toDateString(),
                'produk' => $row->produk->nama_produk,
                'jumlah' => (int) $row->jumlah_restock,
            ]);

        return Inertia::render('datastok', [
            'restock' => $restock,
            'produkOptions' => self::produkOptions(),
            'bulanOptions' => self::bulanOptions(),
            'tahunOptions' => self::tahunOptions(),
            'filters' => [
                'produk' => $produkId,
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'canManage' => $request->user()?->role !== 'Admin',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'produk_id' => ['required', 'exists:produk,produk_id'],
            'jumlah' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $restock = DataRestock::create([
                'restock_id' => (string) Str::uuid(),
                'tanggal' => $validated['tanggal'],
                'produk_id' => $validated['produk_id'],
                'jumlah_restock' => $validated['jumlah'],
            ]);

            $produk = Produk::find($validated['produk_id']);
            $produk->increment('stok', $validated['jumlah']);

            $user = $request->user();
            StokService::notifyPemilikActivity(
                'restock_baru',
                'Restock Baru',
                "{$user->username} menambahkan restock {$produk->nama_produk} sebanyak {$validated['jumlah']} unit",
                'restock',
                $restock->restock_id
            );
        });

        return redirect()->back();
    }

    public function update(Request $request, DataRestock $stok): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'produk_id' => ['required', 'exists:produk,produk_id'],
            'jumlah' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $stok) {
            $produkLama = Produk::find($stok->produk_id);
            $produkBaru = Produk::find($validated['produk_id']);

            if ($produkLama->produk_id === $produkBaru->produk_id) {
                // Same product, adjust diff
                $selisih = $validated['jumlah'] - $stok->jumlah_restock;
                if ($selisih !== 0) {
                    $produkLama->increment('stok', $selisih);
                }
            } else {
                // Different product, revert old, add to new
                $produkLama->decrement('stok', $stok->jumlah_restock);
                $produkBaru->increment('stok', $validated['jumlah']);
            }

            $stok->update([
                'tanggal' => $validated['tanggal'],
                'produk_id' => $validated['produk_id'],
                'jumlah_restock' => $validated['jumlah'],
            ]);
        });

        return redirect()->back();
    }

    public function destroy(DataRestock $stok): RedirectResponse
    {
        DB::transaction(function () use ($stok) {
            $produk = Produk::find($stok->produk_id);
            if ($produk) {
                // Stok hasil tidak boleh negatif? We could validate or just decrement
                $newStok = max(0, $produk->stok - $stok->jumlah_restock);
                $produk->update(['stok' => $newStok]);
                
                if ($newStok <= $produk->stok_minimum) {
                    StokService::notifyStokMinimum($produk);
                }
            }
            $stok->delete();
        });

        return redirect()->back();
    }

    public static function tahunOptions(): array
    {
        $driver = DB::connection()->getDriverName();
        $yearExpression = match ($driver) {
            'pgsql' => 'EXTRACT(YEAR FROM tanggal)',
            'sqlite' => "strftime('%Y', tanggal)",
            default => 'YEAR(tanggal)',
        };

        return DataRestock::query()
            ->select(DB::raw("{$yearExpression} as tahun"))
            ->distinct()
            ->orderBy('tahun')
            ->pluck('tahun')
            ->map(fn ($tahun) => (string) $tahun)
            ->all();
    }

    public static function produkOptions(): array
    {
        return Produk::query()
            ->orderBy('nama_produk')
            ->get()
            ->map(fn($p) => ['id' => $p->produk_id, 'nama' => $p->nama_produk])
            ->all();
    }

    public static function bulanOptions(): array
    {
        $driver = DB::connection()->getDriverName();
        $monthExpression = match ($driver) {
            'pgsql' => 'EXTRACT(MONTH FROM tanggal)',
            'sqlite' => "strftime('%m', tanggal)",
            default => 'MONTH(tanggal)',
        };

        return DataRestock::query()
            ->select(DB::raw("{$monthExpression} as bulan"))
            ->distinct()
            ->orderBy('bulan')
            ->pluck('bulan')
            ->map(fn ($bulan) => str_pad((string) $bulan, 2, '0', STR_PAD_LEFT))
            ->all();
    }
}
