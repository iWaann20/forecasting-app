<?php

namespace App\Http\Controllers;

use App\Models\DataPenjualan;
use App\Models\Produk;
use App\Services\StokService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PenjualanController extends Controller
{
    public function index(Request $request): Response
    {
        $produkId = $request->query('produk');
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun');
        $query = DataPenjualan::with('produk');

        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        if ($bulan) {
            $query->whereMonth('tanggal', (int) $bulan);
        }

        if ($tahun) {
            $query->whereYear('tanggal', (int) $tahun);
        }

        $penjualan = $query
            ->orderByDesc('tanggal')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->penjualan_id,
                'produk_id' => $row->produk_id,
                'tanggal' => $row->tanggal?->toDateString(),
                'produk' => $row->produk->nama_produk,
                'jumlah' => (int) $row->jumlah_terjual,
            ]);

        return Inertia::render('datapenjualan', [
            'penjualan' => $penjualan,
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

        $produk = Produk::find($validated['produk_id']);

        if ($produk->stok < $validated['jumlah']) {
            return redirect()->back()->withErrors([
                'jumlah' => "Stok tidak mencukupi. Stok tersedia: {$produk->stok} unit.",
            ])->withInput();
        }

        DB::transaction(function () use ($validated, $request, $produk) {
            $penjualan = DataPenjualan::create([
                'penjualan_id' => (string) Str::uuid(),
                'tanggal' => $validated['tanggal'],
                'produk_id' => $validated['produk_id'],
                'jumlah_terjual' => $validated['jumlah'],
            ]);

            $produk->decrement('stok', $validated['jumlah']);
            $produk->refresh();

            if ($produk->stok <= $produk->stok_minimum) {
                StokService::notifyStokMinimum($produk);
            }

            $user = $request->user();
            StokService::notifyPemilikActivity(
                'penjualan_baru',
                'Penjualan Baru',
                "{$user->username} menambahkan penjualan {$produk->nama_produk} sebanyak {$validated['jumlah']} unit",
                'penjualan',
                $penjualan->penjualan_id
            );
        });

        return redirect()->back();
    }

    public function update(Request $request, DataPenjualan $penjualan): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'produk_id' => ['required', 'exists:produk,produk_id'],
            'jumlah' => ['required', 'integer', 'min:1'],
        ]);

        $produkLama = Produk::find($penjualan->produk_id);
        $produkBaru = Produk::find($validated['produk_id']);

        // Calculate available stock considering current sales data
        if ($produkLama->produk_id === $produkBaru->produk_id) {
            // Same product: stok tersedia = stok saat ini + jumlah lama (kembalikan dulu)
            $stokTersedia = $produkLama->stok + $penjualan->jumlah_terjual;
            if ($validated['jumlah'] > $stokTersedia) {
                return redirect()->back()->withErrors([
                    'jumlah' => "Stok tidak mencukupi. Stok tersedia (setelah dikembalikan): {$stokTersedia} unit.",
                ])->withInput();
            }
        } else {
            // Different product: cek stok produk baru
            if ($validated['jumlah'] > $produkBaru->stok) {
                return redirect()->back()->withErrors([
                    'jumlah' => "Stok produk baru tidak mencukupi. Stok tersedia: {$produkBaru->stok} unit.",
                ])->withInput();
            }
        }

        DB::transaction(function () use ($validated, $penjualan, $request, $produkLama, $produkBaru) {
            if ($produkLama->produk_id === $produkBaru->produk_id) {
                $selisih = $validated['jumlah'] - $penjualan->jumlah_terjual;
                if ($selisih !== 0) {
                    $produkLama->decrement('stok', $selisih);
                    $produkLama->refresh();
                    if ($produkLama->stok <= $produkLama->stok_minimum) {
                        StokService::notifyStokMinimum($produkLama);
                    }
                }
            } else {
                $produkLama->increment('stok', $penjualan->jumlah_terjual);
                $produkBaru->decrement('stok', $validated['jumlah']);
                $produkBaru->refresh();
                if ($produkBaru->stok <= $produkBaru->stok_minimum) {
                    StokService::notifyStokMinimum($produkBaru);
                }
            }

            $penjualan->update([
                'tanggal' => $validated['tanggal'],
                'produk_id' => $validated['produk_id'],
                'jumlah_terjual' => $validated['jumlah'],
            ]);

            $user = $request->user();
            StokService::notifyPemilikActivity(
                'penjualan_baru',
                'Penjualan Diperbarui',
                "{$user->username} mengubah data penjualan {$produkBaru->nama_produk}",
                'penjualan',
                $penjualan->penjualan_id
            );
        });

        return redirect()->back();
    }

    public function destroy(DataPenjualan $penjualan): RedirectResponse
    {
        DB::transaction(function () use ($penjualan) {
            $produk = Produk::find($penjualan->produk_id);
            if ($produk) {
                $produk->increment('stok', $penjualan->jumlah_terjual);
            }
            $penjualan->delete();
        });

        return redirect()->back();
    }

    public static function total(): int
    {
        return DataPenjualan::count();
    }

    public static function totalPerProduk(?string $tahun = null): array
    {
        $query = DataPenjualan::with('produk');

        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return $query
            ->select('produk_id', DB::raw('SUM(jumlah_terjual) as total'))
            ->groupBy('produk_id')
            ->get()
            ->map(fn ($row) => [
                'produk' => $row->produk->nama_produk,
                'total' => (int) $row->total,
            ])
            ->sortBy('produk')
            ->values()
            ->all();
    }

    public static function totalPerPeriode(?string $produkId = null, ?string $tahun = null): array
    {
        $query = DataPenjualan::query();
        $driver = DB::connection()->getDriverName();

        $periodeExpression = match ($driver) {
            'pgsql' => "to_char(tanggal, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', tanggal)",
            default => "DATE_FORMAT(tanggal, '%Y-%m')",
        };

        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return $query
            ->select(DB::raw("{$periodeExpression} as periode"), DB::raw('SUM(jumlah_terjual) as total'))
            ->groupBy('periode')
            ->orderBy('periode')
            ->get()
            ->map(fn ($row) => [
                'periode' => $row->periode,
                'total' => (int) $row->total,
            ])
            ->all();
    }

    public static function totalPerProdukPerPeriode(?string $tahun = null): array
    {
        $query = DataPenjualan::with('produk');
        $driver = DB::connection()->getDriverName();

        $periodeExpression = match ($driver) {
            'pgsql' => "to_char(tanggal, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', tanggal)",
            default => "DATE_FORMAT(tanggal, '%Y-%m')",
        };

        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return $query
            ->select(
                DB::raw("{$periodeExpression} as periode"),
                'produk_id',
                DB::raw('SUM(jumlah_terjual) as total'),
            )
            ->groupBy('periode', 'produk_id')
            ->orderBy('periode')
            ->get()
            ->map(fn ($row) => [
                'periode' => $row->periode,
                'produk' => $row->produk->nama_produk,
                'total' => (int) $row->total,
            ])
            ->sortBy(fn($item) => $item['periode'] . $item['produk'])
            ->values()
            ->all();
    }

    public static function tahunOptions(): array
    {
        $driver = DB::connection()->getDriverName();
        $yearExpression = match ($driver) {
            'pgsql' => 'EXTRACT(YEAR FROM tanggal)',
            'sqlite' => "strftime('%Y', tanggal)",
            default => 'YEAR(tanggal)',
        };

        return DataPenjualan::query()
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
            ->map(fn($p) => [
                'id' => $p->produk_id,
                'nama' => $p->nama_produk,
                'stok' => (int) $p->stok,
                'stok_minimum' => (int) $p->stok_minimum,
            ])
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

        return DataPenjualan::query()
            ->select(DB::raw("{$monthExpression} as bulan"))
            ->distinct()
            ->orderBy('bulan')
            ->pluck('bulan')
            ->map(fn ($bulan) => str_pad((string) $bulan, 2, '0', STR_PAD_LEFT))
            ->all();
    }

    public function checkRange(Request $request)
    {
        $validated = $request->validate([
            'periode_awal' => ['required', 'date'],
            'periode_akhir' => ['required', 'date', 'after_or_equal:periode_awal'],
        ]);

        $hasData = DataPenjualan::query()
            ->whereDate('tanggal', '>=', $validated['periode_awal'])
            ->whereDate('tanggal', '<=', $validated['periode_akhir'])
            ->exists();

        return response()->json(['has_data' => $hasData]);
    }
}
