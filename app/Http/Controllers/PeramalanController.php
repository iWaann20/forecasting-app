<?php

namespace App\Http\Controllers;

use App\Models\DataPeramalan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PeramalanController extends Controller
{
    public function index(Request $request): Response
    {
        $produk = $request->query('produk');
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun');
        $query = DataPeramalan::query();

        if ($produk) {
            $query->where('nama_produk', $produk);
        }

        if ($bulan) {
            $query->whereMonth('periode_awal', (int) $bulan);
        }

        if ($tahun) {
            $query->whereYear('periode_awal', (int) $tahun);
        }

        $peramalan = $query
            ->orderByDesc('periode_awal')
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->peramalan_id,
                'periode' => $row->periode_awal?->format('Y-m'),
                'produk' => $row->nama_produk,
                'nilai' => (int) $row->nilai_peramalan,
            ]);

        return Inertia::render('dataperamalan', [
            'peramalan' => $peramalan,
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

    public function destroy(DataPeramalan $peramalan): RedirectResponse
    {
        $peramalan->delete();

        return redirect()->back();
    }

    public static function total(): int
    {
        return DataPeramalan::count();
    }

    public static function tahunOptions(): array
    {
        $driver = DB::connection()->getDriverName();
        $yearExpression = match ($driver) {
            'pgsql' => 'EXTRACT(YEAR FROM periode_awal)',
            'sqlite' => "strftime('%Y', periode_awal)",
            default => 'YEAR(periode_awal)',
        };

        return DataPeramalan::query()
            ->select(DB::raw("{$yearExpression} as tahun"))
            ->distinct()
            ->orderBy('tahun')
            ->pluck('tahun')
            ->map(fn ($tahun) => (string) $tahun)
            ->all();
    }

    public static function produkOptions(): array
    {
        return DataPeramalan::query()
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
            'pgsql' => 'EXTRACT(MONTH FROM periode_awal)',
            'sqlite' => "strftime('%m', periode_awal)",
            default => 'MONTH(periode_awal)',
        };

        return DataPeramalan::query()
            ->select(DB::raw("{$monthExpression} as bulan"))
            ->distinct()
            ->orderBy('bulan')
            ->pluck('bulan')
            ->map(fn ($bulan) => str_pad((string) $bulan, 2, '0', STR_PAD_LEFT))
            ->all();
    }
}
