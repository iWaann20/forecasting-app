<?php

namespace App\Http\Controllers;

use App\Models\DataPeramalan;
use App\Services\Peramalan\PeramalanService;
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
        $preview = $request->session()->get('peramalan_preview');
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
            'preview' => $preview,
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

    public function hitung(Request $request, PeramalanService $peramalanService): RedirectResponse
    {
        $validated = $request->validate([
            'periode_awal' => ['required', 'date'],
            'periode_akhir' => ['required', 'date', 'after_or_equal:periode_awal'],
        ]);

        $preview = $peramalanService->hitungSemuaPreview(
            $validated['periode_awal'],
            $validated['periode_akhir'],
        );

        $request->session()->put('peramalan_preview', $preview);

        return redirect()->route('dataperamalan');
    }

    public function simpan(Request $request, PeramalanService $peramalanService): RedirectResponse
    {
        $preview = $request->session()->get('peramalan_preview');

        if (! is_array($preview) || empty($preview['items'])) {
            return redirect()->route('dataperamalan');
        }

        $peramalanService->simpanHasil($preview['items']);
        $request->session()->forget('peramalan_preview');

        return redirect()->route('dataperamalan');
    }

    public function batal(Request $request): RedirectResponse
    {
        $request->session()->forget('peramalan_preview');

        return redirect()->route('dataperamalan');
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
