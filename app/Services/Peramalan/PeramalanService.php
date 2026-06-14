<?php

namespace App\Services\Peramalan;

use App\Models\DataPenjualan;
use App\Models\DataPeramalan;
use App\Models\Produk;
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
	 * @return array{periode_awal: string, periode_akhir: string, items: array<int, array<string, mixed>>}
	 */
	public function hitungSemuaPreview(
		string $periodeAwal,
		string $periodeAkhir,
	): array {
		$start = Carbon::parse($periodeAwal)->startOfMonth();
		$end = Carbon::parse($periodeAkhir)->endOfMonth();
		$forecastStart = $end->copy()->addMonthNoOverflow()->startOfMonth();
		$results = [];

		foreach ($this->produkList() as $produkId) {
			$results[] = $this->hitungProdukPreview(
				$produkId,
				$start,
				$end,
				$forecastStart
			);
		}

		return [
			'periode_awal' => $start->toDateString(),
			'periode_akhir' => $end->toDateString(),
			'items' => $results,
		];
	}

	/**
	 * @param array<int, array<string, mixed>> $items
	 */
	public function simpanHasil(array $items): void
	{
		foreach ($items as $item) {
			DataPeramalan::create($item);
		}
	}

	/**
	 * @return array<string, mixed>
	 */
	private function hitungProdukPreview(
		string $produkId,
		Carbon $start,
		Carbon $end,
		Carbon $forecastStart
	): array {
		$periodeList = $this->buildPeriodeList($start, $end);
		$actuals = $this->loadActuals($produkId, $start, $end, $periodeList);

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
			'produk_id' => $produkId,
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

		$produk = Produk::find($produkId);

		return [
			'peramalan_id' => (string) Str::uuid(),
			'periode' => $forecastStart->toDateString(),
			'periode_awal' => $start->toDateString(),
			'periode_akhir' => $end->toDateString(),
			'produk_id' => $produkId,
			'nama_produk' => $produk ? $produk->nama_produk : 'Unknown', // for preview only
			'nilai_peramalan' => $nextForecast !== null ? (int) round($nextForecast) : 0,
			'alpha' => $bestAlpha,
			'mad' => $evaluasi['mad'],
			'mse' => $evaluasi['mse'],
		];
	}

	/**
	 * @return array<int, string>
	 */
	private function produkList(): array
	{
		return Produk::query()
			->select('produk_id')
			->pluck('produk_id')
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
	private function loadActuals(string $produkId, Carbon $start, Carbon $end, array $periodeList): array
	{
		$driver = DB::connection()->getDriverName();
		$periodeExpression = match ($driver) {
			'pgsql' => "to_char(tanggal, 'YYYY-MM')",
			'sqlite' => "strftime('%Y-%m', tanggal)",
			default => "DATE_FORMAT(tanggal, '%Y-%m')",
		};

		$rows = DataPenjualan::query()
			->select(DB::raw("{$periodeExpression} as periode"), DB::raw('SUM(jumlah_terjual) as total'))
			->where('produk_id', $produkId)
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

