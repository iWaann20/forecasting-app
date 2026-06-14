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
        $canSeePeramalan = in_array($request->user()?->role, ['Pemilik Usaha', 'Admin']);
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
        if ($canSeePeramalan) {
            $driver = DB::connection()->getDriverName();

            $periodeExpression = match ($driver) {
                'pgsql' => "to_char(data_peramalan.periode, 'YYYY-MM')",
                'sqlite' => "strftime('%Y-%m', data_peramalan.periode)",
                default => "DATE_FORMAT(data_peramalan.periode, '%Y-%m')",
            };

            $baseQuery = DataPeramalan::with('produk');

            if ($produkId) {
                $baseQuery->where('produk_id', $produkId);
            }

            if ($tahun) {
                $baseQuery->whereYear('data_peramalan.periode', $tahun);
            }

            // Total per periode
            $peramalanPerPeriode = (clone $baseQuery)
                ->select(DB::raw("{$periodeExpression} as periode"), DB::raw('SUM(nilai_peramalan) as total'))
                ->groupBy(DB::raw($periodeExpression))
                ->orderBy('periode')
                ->get()
                ->map(fn ($row) => [
                    'periode' => $row->getRawOriginal('periode') ?? (is_object($row->periode) ? $row->periode->format('Y-m') : $row->periode),
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
                ->groupBy(DB::raw($periodeExpression), 'produk_id')
                ->orderBy('periode')
                ->get()
                ->map(fn ($row) => [
                    'periode' => $row->getRawOriginal('periode') ?? (is_object($row->periode) ? $row->periode->format('Y-m') : $row->periode),
                    'produk' => $row->produk->nama_produk,
                    'total' => (int) $row->total,
                ])
                ->sortBy(fn($item) => $item['periode'] . $item['produk'])
                ->values()
                ->all();
        }

        return Inertia::render('dashboard', [
            'totalPenjualan' => DataPenjualan::count(),
            'totalPeramalan' => $canSeePeramalan ? DataPeramalan::count() : null,
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
            'canSeePeramalan' => $canSeePeramalan,
        ]);
    }
}
