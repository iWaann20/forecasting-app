<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="utf-8" />
    <title>{{ $title }}</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: "DejaVu Sans", Arial, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 24px 28px;
        }

        .header {
            display: table;
            width: 100%;
            padding-bottom: 4px;
            margin-bottom: 6px;
        }

        .header-left,
        .header-center,
        .header-right {
            display: table-cell;
            vertical-align: top;
        }

        .header-left {
            width: 22%;
        }

        .header-center {
            width: 46%;
            text-align: left;
            padding-top: 4px;
        }

        .header-right {
            width: 32%;
            text-align: right;
            font-size: 10px;
            line-height: 1.45;
        }

        .logo {
            width: 160px;
            height: auto;
        }

        .company-name {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .company-tagline {
            font-size: 12px;
            color: #dc2626;
            text-transform: uppercase;
            font-weight: bold;
        }

        .header-divider {
            height: 1.5px;
            background: #111827;
            margin: 2px 0 16px;
        }

        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 6px 0 15px;
            text-transform: uppercase;
        }


        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #111827;
        }

        th,
        td {
            padding: 7px 8px;
            border: 1px solid #111827;
            text-align: center;
        }

        th {
            background: #f9fafb;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.04em;
            font-weight: bold;
        }

        td.number {
            text-align: center;
        }

        td.center {
            text-align: center;
        }

        .notes {
            margin-top: 14px;
            font-size: 11px;
            line-height: 1.5;
        }

        .notes-title {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .notes-list {
            margin: 0;
            padding-left: 16px;
        }

        .notes-list li {
            margin-bottom: 4px;
        }
    </style>
</head>

<body>
    <div class="header">
        <div class="header-left">
            @if (!empty($logoPath) && file_exists($logoPath))
                <img class="logo" src="{{ $logoPath }}" alt="Logo" />
            @endif
        </div>
        <div class="header-center">
            <div class="company-name">CV. ANUGERAH AJITAMA</div>
            <div class="company-tagline">SUPPLIER BAHAN BANGUNAN</div>
        </div>
        <div class="header-right">
            <div>PERMATA CANDILOKA Y-12</div>
            <div>BALONGGABUS, CANDI - SIDOARJO</div>
            <div>Telp : 031 8959416, 082220524447</div>
            <div>Fax : 031 8959416</div>
            <div>email : anugerahajitama@gmail.com</div>
        </div>
    </div>

    <div class="header-divider"></div>

    <div class="title">{{ $title }}</div>

    @php
        $formatProduk = function (?string $value): string {
            if (!$value) {
                return '-';
            }

            $normalized = str_replace('_', ' ', strtolower($value));
            return ucfirst($normalized);
        };

        $formatPeriode = function (?string $value): string {
            if (!$value) {
                return '-';
            }

            try {
                return \Illuminate\Support\Carbon::createFromFormat('Y-m', $value)
                    ->locale('id')
                    ->translatedFormat('F Y');
            } catch (Throwable $e) {
                return $value;
            }
        };
    @endphp

    <table>
        <thead>
            <tr>
                <th style="width: 6%">No</th>
                <th style="width: 24%">Periode</th>
                <th>Produk</th>
                <th style="width: 10%">Alpha</th>
                <th style="width: 12%">MSE</th>
                <th style="width: 12%">MAD</th>
                <th style="width: 22%">Nilai Peramalan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($items as $index => $row)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>{{ $formatPeriode($row['periode'] ?? null) }}</td>
                    <td>{{ $formatProduk($row['produk'] ?? null) }}</td>
                    <td class="center">
                        {{ $row['alpha'] !== null ? number_format((float) $row['alpha'], 1, ',', '.') : '-' }}
                    </td>
                    <td class="center">
                        {{ $row['mse'] !== null ? number_format((float) $row['mse'], 2, ',', '.') : '-' }}
                    </td>
                    <td class="center">
                        {{ $row['mad'] !== null ? number_format((float) $row['mad'], 2, ',', '.') : '-' }}
                    </td>
                    <td class="number">{{ number_format($row['nilai'] ?? 0, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="center">Tidak ada data.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="notes">
        <div class="notes-title">Keterangan:</div>
        <ul class="notes-list">
            <li>Alpha: Parameter penghalus dalam peramalan. Nilai mendekati 1 berarti sistem lebih mengutamakan data
                terbaru, nilai mendekati 0 berarti sistem lebih mempertimbangkan data lama.</li>
            <li>MSE: Mean Squared Error, ukuran seberapa jauh hasil perkiraan meleset dari data asli. Nilainya
                dikuadratkan, sehingga kesalahan besar akan terlihat lebih menonjol. Semakin kecil nilainya, semakin
                akurat perkiraan.</li>
            <li>MAD: Mean Absolute Deviation, Rata-rata selisih antara peramalan dan data asli tanpa memandang lebih
                atau kurang. Semakin kecil nilainya, semakin baik.</li>
            <li>Nilai Peramalan: Jumlah stok yang disarankan untuk disiapkan pada periode berikutnya, sudah termasuk
                sisa stok yang ada. Angka ini dihitung otomatis berdasarkan pola penjualan sebelumnya.</li>
        </ul>
    </div>
</body>

</html>
