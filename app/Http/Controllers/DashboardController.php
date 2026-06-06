<?php

namespace App\Http\Controllers;

use App\Models\DataPenjualan;
use App\Models\DataPeramalan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $isPemilik = $request->user()?->role === 'pemilik';
        $produkId = $request->query('produk');
        $tahun = $request->query('tahun');

        if (!$tahun) {
            $periode = $request->query('periode');
            if ($periode) {
                $tahun = substr((string) $periode, 0, 4);
            }
        }

        $peramalanPerPeriode = [];
        $peramalanPerProdukPerPeriode = [];
        if ($isPemilik) {
            $driver = DB::connection()->getDriverName();

            $periodeExpression = match ($driver) {
                'pgsql' => "to_char(periode_awal, 'YYYY-MM')",
                'sqlite' => "strftime('%Y-%m', periode_awal)",
                default => "DATE_FORMAT(periode_awal, '%Y-%m')",
            };

            $baseQuery = DataPeramalan::with('produk');

            if ($produkId) {
                $baseQuery->where('produk_id', $produkId);
            }

            if ($tahun) {
                $baseQuery->whereYear('periode_awal', $tahun);
            }

            // Total per periode
            $peramalanPerPeriode = (clone $baseQuery)
                ->select(DB::raw("{$periodeExpression} as periode"), DB::raw('SUM(nilai_peramalan) as total'))
                ->groupBy('periode')
                ->orderBy('periode')
                ->get()
                ->map(fn ($row) => [
                    'periode' => $row->periode,
                    'total' => (int) $row->total,
                ])
                ->all();

            // Per produk per periode (untuk tooltip)
            $peramalanPerProdukPerPeriode = (clone $baseQuery)
                ->select(
                    DB::raw("{$periodeExpression} as periode"),
                    'produk_id',
                    DB::raw('SUM(nilai_peramalan) as total'),
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

        return Inertia::render('dashboard', [
            'totalPenjualan' => DataPenjualan::count(),
            'totalPeramalan' => $isPemilik ? DataPeramalan::count() : null,
            'penjualanPerProduk' => PenjualanController::totalPerProduk($tahun),
            'penjualanPerPeriode' => PenjualanController::totalPerPeriode($produkId, $tahun),
            'penjualanPerProdukPerPeriode' => PenjualanController::totalPerProdukPerPeriode($tahun),
            'peramalanPerPeriode' => $peramalanPerPeriode,
            'peramalanPerProdukPerPeriode' => $peramalanPerProdukPerPeriode ?? [],
            'produkOptions' => PenjualanController::produkOptions(),
            'tahunOptions' => PenjualanController::tahunOptions(),
            'filters' => [
                'produk' => $produkId,
                'tahun' => $tahun,
            ],
            'canSeePeramalan' => $isPemilik,
        ]);
    }
}
