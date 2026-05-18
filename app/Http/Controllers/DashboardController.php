<?php

namespace App\Http\Controllers;

use App\Models\DataPenjualan;
use App\Models\DataPeramalan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $produk = $request->query('produk');
        $tahun = $request->query('tahun');

        if (!$tahun) {
            $periode = $request->query('periode');
            if ($periode) {
                $tahun = substr((string) $periode, 0, 4);
            }
        }

        return Inertia::render('dashboard', [
            'totalPenjualan' => DataPenjualan::count(),
            'totalPeramalan' => DataPeramalan::count(),
            'penjualanPerProduk' => PenjualanController::totalPerProduk($tahun),
            'penjualanPerPeriode' => PenjualanController::totalPerPeriode($produk, $tahun),
            'penjualanPerProdukPerPeriode' => PenjualanController::totalPerProdukPerPeriode($tahun),
            'tahunOptions' => PenjualanController::tahunOptions(),
            'filters' => [
                'produk' => $produk,
                'tahun' => $tahun,
            ],
        ]);
    }
}
