<?php

namespace App\Http\Controllers;

use App\Models\DataPenjualan;
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
        $produk = $request->query('produk');
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun');
        $query = DataPenjualan::query();

        if ($produk) {
            $query->where('nama_produk', $produk);
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
                'tanggal' => $row->tanggal?->toDateString(),
                'produk' => $row->nama_produk,
                'jumlah' => (int) $row->jumlah_terjual,
            ]);

        return Inertia::render('datapenjualan', [
            'penjualan' => $penjualan,
            'produkOptions' => self::produkOptions(),
            'bulanOptions' => self::bulanOptions(),
            'tahunOptions' => self::tahunOptions(),
            'filters' => [
                'produk' => $produk,
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal' => ['required', 'date'],
            'produk' => ['required', 'string', 'max:255'],
            'jumlah' => ['required', 'integer', 'min:1'],
        ]);

        DataPenjualan::create([
            'penjualan_id' => (string) Str::uuid(),
            'tanggal' => $validated['tanggal'],
            'nama_produk' => $validated['produk'],
            'jumlah_terjual' => $validated['jumlah'],
        ]);

        return redirect()->back();
    }

    public function destroy(DataPenjualan $penjualan): RedirectResponse
    {
        $penjualan->delete();

        return redirect()->back();
    }

    public static function total(): int
    {
        return DataPenjualan::count();
    }

    public static function totalPerProduk(?string $tahun = null): array
    {
        $query = DataPenjualan::query();

        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return $query
            ->select('nama_produk', DB::raw('SUM(jumlah_terjual) as total'))
            ->groupBy('nama_produk')
            ->orderBy('nama_produk')
            ->get()
            ->map(fn ($row) => [
                'produk' => $row->nama_produk,
                'total' => (int) $row->total,
            ])
            ->all();
    }

    public static function totalPerPeriode(?string $produk = null, ?string $tahun = null): array
    {
        $query = DataPenjualan::query();
        $driver = DB::connection()->getDriverName();

        $periodeExpression = match ($driver) {
            'pgsql' => "to_char(tanggal, 'YYYY-MM')",
            'sqlite' => "strftime('%Y-%m', tanggal)",
            default => "DATE_FORMAT(tanggal, '%Y-%m')",
        };

        if ($produk) {
            $query->where('nama_produk', $produk);
        }

        if ($tahun) {
            $query->whereYear('tanggal', $tahun);
        }

        return $query
            // Periode format YYYY-MM; format ke label bulan di sisi frontend.
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
        $query = DataPenjualan::query();
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
                'nama_produk',
                DB::raw('SUM(jumlah_terjual) as total'),
            )
            ->groupBy('periode', 'nama_produk')
            ->orderBy('periode')
            ->orderBy('nama_produk')
            ->get()
            ->map(fn ($row) => [
                'periode' => $row->periode,
                'produk' => $row->nama_produk,
                'total' => (int) $row->total,
            ])
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
        return DataPenjualan::query()
            ->select('nama_produk')
            ->distinct()
            ->orderBy('nama_produk')
            ->pluck('nama_produk')
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
