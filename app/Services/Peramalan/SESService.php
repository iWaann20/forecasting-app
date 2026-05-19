<?php

namespace App\Services\Peramalan;

class SESService
{
	/**
	 * @param  array<int, float|int>  $actuals
	 * @return array<int, float>
	 */
	public function generate(array $actuals, float $alpha, ?float $initialForecast = null): array
	{
		if ($alpha <= 0 || $alpha >= 1) {
			throw new \InvalidArgumentException('Alpha harus di antara 0 dan 1.');
		}

		$count = count($actuals);
		if ($count === 0) {
			return [];
		}

		$forecast = [];
		$forecast[0] = $initialForecast ?? (float) $actuals[0];

		for ($i = 1; $i < $count; $i++) {
			$forecast[$i] = ($alpha * (float) $actuals[$i - 1])
				+ ((1 - $alpha) * $forecast[$i - 1]);
		}

		return $forecast;
	}

	/**
	 * @param  array<int, float|int>  $actuals
	 */
	public function forecastNext(array $actuals, float $alpha, ?float $initialForecast = null): ?float
	{
		$forecast = $this->generate($actuals, $alpha, $initialForecast);
		$count = count($actuals);

		if ($count === 0) {
			return null;
		}

		$lastForecast = $forecast[$count - 1] ?? (float) $actuals[$count - 1];
		return ($alpha * (float) $actuals[$count - 1]) + ((1 - $alpha) * $lastForecast);
	}
}
