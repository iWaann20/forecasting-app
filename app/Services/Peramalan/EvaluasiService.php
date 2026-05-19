<?php

namespace App\Services\Peramalan;

class EvaluasiService
{
	/**
	 * @param  array<int, float|int>  $actuals
	 * @param  array<int, float|int>  $forecasts
	 * @return array{mad: float|null, mse: float|null, n: int}
	 */
	public function evaluate(array $actuals, array $forecasts, int $startIndex = 1): array
	{
		$count = min(count($actuals), count($forecasts));
		if ($count === 0 || $startIndex >= $count) {
			return ['mad' => null, 'mse' => null, 'n' => 0];
		}

		$sumAbs = 0.0;
		$sumSq = 0.0;
		$n = 0;

		for ($i = $startIndex; $i < $count; $i++) {
			$error = (float) $actuals[$i] - (float) $forecasts[$i];
			$sumAbs += abs($error);
			$sumSq += $error ** 2;
			$n++;
		}

		if ($n === 0) {
			return ['mad' => null, 'mse' => null, 'n' => 0];
		}

		return [
			'mad' => $sumAbs / $n,
			'mse' => $sumSq / $n,
			'n' => $n,
		];
	}
}
