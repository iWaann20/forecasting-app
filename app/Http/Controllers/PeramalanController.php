<?php

namespace App\Http\Controllers;

use App\Models\DataPeramalan;
use App\Models\Produk;
use App\Services\Peramalan\PeramalanService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PeramalanController extends Controller
{
    public function index(Request $request): Response
    {
        $produkId = $request->query('produk');
        $bulan = $request->query('bulan');
        $tahun = $request->query('tahun');
        $preview = $request->session()->get('peramalan_preview');
        $cetakPreview = $request->session()->get('peramalan_cetak_preview');
        $query = DataPeramalan::with('produk');

        if ($produkId) {
            $query->where('produk_id', $produkId);
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
                'produk_id' => $row->produk_id,
                'periode' => $row->periode_awal?->format('Y-m'),
                'produk' => $row->produk->nama_produk,
                'nilai' => (int) $row->nilai_peramalan,
            ]);

        return Inertia::render('dataperamalan', [
            'peramalan' => $peramalan,
            'produkOptions' => self::produkOptions(),
            'bulanOptions' => self::bulanOptions(),
            'tahunOptions' => self::tahunOptions(),
            'preview' => $preview,
            'cetakPreview' => $cetakPreview,
            'filters' => [
                'produk' => $produkId,
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

    public function cetakPreview(Request $request): RedirectResponse
    {
        [$produkId, $bulan, $tahun] = $this->extractFilters($request);
        $query = DataPeramalan::with('produk');

        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        if ($bulan) {
            $query->whereMonth('periode_awal', (int) $bulan);
        }

        if ($tahun) {
            $query->whereYear('periode_awal', (int) $tahun);
        }

        $items = $query
            ->orderByDesc('periode_awal')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->peramalan_id,
                'periode' => $row->periode_awal?->format('Y-m'),
                'produk' => $row->produk->nama_produk,
                'alpha' => $row->alpha !== null ? (float) $row->alpha : null,
                'mse' => $row->mse !== null ? (float) $row->mse : null,
                'mad' => $row->mad !== null ? (float) $row->mad : null,
                'nilai' => (int) $row->nilai_peramalan,
            ])
            ->all();

        // Get product name for display if filtered
        $produkName = null;
        if ($produkId) {
            $p = Produk::find($produkId);
            $produkName = $p ? $p->nama_produk : null;
        }

        $request->session()->put('peramalan_cetak_preview', [
            'filters' => [
                'produk' => $produkId, // Keep ID for logic
                'produk_name' => $produkName, // Add name for display
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'items' => $items,
        ]);

        return redirect()->route('dataperamalan');
    }

    public function cetakBatal(Request $request): RedirectResponse
    {
        $request->session()->forget('peramalan_cetak_preview');

        return redirect()->route('dataperamalan');
    }

    public function cetak(Request $request)
    {
        $preview = $request->session()->get('peramalan_cetak_preview');
        $filters = is_array($preview) ? ($preview['filters'] ?? []) : [];
        $items = is_array($preview) ? ($preview['items'] ?? []) : [];

        if (empty($items)) {
            [$produkId, $bulan, $tahun] = $this->extractFilters($request);
            
            $produkName = null;
            if ($produkId) {
                $p = Produk::find($produkId);
                $produkName = $p ? $p->nama_produk : null;
            }

            $filters = [
                'produk' => $produkId,
                'produk_name' => $produkName,
                'bulan' => $bulan,
                'tahun' => $tahun,
            ];
            $items = $this->buildCetakItems($produkId, $bulan, $tahun);
        }

        $pdf = Pdf::loadView('prints.peramalan', [
            'title' => 'Laporan Peramalan',
            'filters' => $filters,
            'items' => $items,
            'logoPath' => public_path('images/cv-anugerah-ajitama.png'),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-peramalan.pdf');
    }

    private function extractFilters(Request $request): array
    {
        $produk = $request->input('produk', $request->query('produk'));
        $bulan = $request->input('bulan', $request->query('bulan'));
        $tahun = $request->input('tahun', $request->query('tahun'));

        return [$produk, $bulan, $tahun];
    }

    private function buildCetakItems(?string $produkId, ?string $bulan, ?string $tahun): array
    {
        $query = DataPeramalan::with('produk');

        if ($produkId) {
            $query->where('produk_id', $produkId);
        }

        if ($bulan) {
            $query->whereMonth('periode_awal', (int) $bulan);
        }

        if ($tahun) {
            $query->whereYear('periode_awal', (int) $tahun);
        }

        return $query
            ->orderByDesc('periode_awal')
            ->get()
            ->map(fn ($row) => [
                'id' => $row->peramalan_id,
                'periode' => $row->periode_awal?->format('Y-m'),
                'produk' => $row->produk->nama_produk,
                'alpha' => $row->alpha !== null ? (float) $row->alpha : null,
                'mse' => $row->mse !== null ? (float) $row->mse : null,
                'mad' => $row->mad !== null ? (float) $row->mad : null,
                'nilai' => (int) $row->nilai_peramalan,
            ])
            ->all();
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
