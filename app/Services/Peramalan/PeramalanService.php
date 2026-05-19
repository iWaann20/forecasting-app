<?php

namespace App\Services\Peramalan;

use App\Models\DataPenjualan;
use App\Models\DataPeramalan;
use App\Services\Peramalan\SESService;
use App\Services\Peramalan\EvaluasiService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PeramalanService
{
	public function __construct(
		private SESService $sesService = new SESService(),
		private EvaluasiService $evaluasiService = new EvaluasiService(),
	) {}

	/**
	 * @return array<int, DataPeramalan>
	 */
	public function hitungSemua(
		string $periodeAwal,
		string $periodeAkhir,
	): array {
		$start = Carbon::parse($periodeAwal)->startOfMonth();
		$end = Carbon::parse($periodeAkhir)->endOfMonth();
		$results = [];

		foreach ($this->produkList() as $produk) {
			$results[] = $this->hitungProduk($produk, $start, $end);
		}

		return $results;
	}

	/**
	 * @return DataPeramalan
	 */
	private function hitungProduk(string $produk, Carbon $start, Carbon $end): DataPeramalan
	{
		$periodeList = $this->buildPeriodeList($start, $end);
		$actuals = $this->loadActuals($produk, $start, $end, $periodeList);

		$bestAlpha = 0.1;
		$bestMse = null;
		$bestMad = null;
		$trialLogs = [];

		for ($alpha = 0.1; $alpha <= 0.9 + 1e-9; $alpha += 0.1) {
			$alpha = round($alpha, 1);
			$forecasts = $this->sesService->generate($actuals, $alpha);
			$evaluasi = $this->evaluasiService->evaluate($actuals, $forecasts);
			$mse = $evaluasi['mse'];
			$mad = $evaluasi['mad'];

			if ($mse === null) {
				continue;
			}

			$trialLogs[] = [
				'alpha' => $alpha,
				'mse' => $mse,
				'mad' => $mad,
			];

			if ($bestMse === null || $mse < $bestMse || ($mse === $bestMse && $mad !== null && ($bestMad === null || $mad < $bestMad))) {
				$bestAlpha = $alpha;
				$bestMse = $mse;
				$bestMad = $mad;
			}
		}

		Log::info('SES alpha trials', [
			'produk' => $produk,
			'periode_awal' => $start->toDateString(),
			'periode_akhir' => $end->toDateString(),
			'trials' => $trialLogs,
			'best' => [
				'alpha' => $bestAlpha,
				'mse' => $bestMse,
				'mad' => $bestMad,
			],
		]);

		$forecasts = $this->sesService->generate($actuals, $bestAlpha);
		$nextForecast = $this->sesService->forecastNext($actuals, $bestAlpha);
		$evaluasi = $this->evaluasiService->evaluate($actuals, $forecasts);

		return DataPeramalan::create([
			'peramalan_id' => (string) Str::uuid(),
			'periode_awal' => $start->toDateString(),
			'periode_akhir' => $end->toDateString(),
			'nama_produk' => $produk,
			'nilai_peramalan' => $nextForecast !== null ? (int) round($nextForecast) : 0,
			'alpha' => $bestAlpha,
			'mad' => $evaluasi['mad'],
			'mse' => $evaluasi['mse'],
		]);
	}

	/**
	 * @return array<int, string>
	 */
	private function produkList(): array
	{
		return DataPenjualan::query()
			->select('nama_produk')
			->distinct()
			->orderBy('nama_produk')
			->pluck('nama_produk')
			->all();
	}

	/**
	 * @return array<int, string>
	 */
	private function buildPeriodeList(Carbon $start, Carbon $end): array
	{
		$periodeList = [];
		$period = CarbonPeriod::create($start->copy()->startOfMonth(), '1 month', $end->copy()->startOfMonth());
		foreach ($period as $date) {
			$periodeList[] = $date->format('Y-m');
		}

		return $periodeList;
	}

	/**
	 * @param  array<int, string>  $periodeList
	 * @return array<int, float>
	 */
	private function loadActuals(string $produk, Carbon $start, Carbon $end, array $periodeList): array
	{
		$driver = DB::connection()->getDriverName();
		$periodeExpression = match ($driver) {
			'pgsql' => "to_char(tanggal, 'YYYY-MM')",
			'sqlite' => "strftime('%Y-%m', tanggal)",
			default => "DATE_FORMAT(tanggal, '%Y-%m')",
		};

		$rows = DataPenjualan::query()
			->select(DB::raw("{$periodeExpression} as periode"), DB::raw('SUM(jumlah_terjual) as total'))
			->where('nama_produk', $produk)
			->whereDate('tanggal', '>=', $start->toDateString())
			->whereDate('tanggal', '<=', $end->toDateString())
			->groupBy('periode')
			->orderBy('periode')
			->get()
			->mapWithKeys(fn ($row) => [$row->periode => (float) $row->total])
			->all();

		$actuals = [];
		foreach ($periodeList as $periode) {
			$actuals[] = $rows[$periode] ?? 0.0;
		}

		return $actuals;
	}
}
