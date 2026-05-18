<?php

namespace App\Http\Controllers;

use App\Models\DataPenjualan;
use Illuminate\Support\Facades\DB;

class PenjualanController extends Controller
{
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
}
