<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataPeramalan extends Model
{
    use HasFactory;

    protected $table = 'data_peramalan';
    protected $primaryKey = 'peramalan_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'peramalan_id',
        'produk_id',
        'periode',
        'periode_awal',
        'periode_akhir',
        'nilai_peramalan',
        'alpha',
        'mad',
        'mse',
    ];

    protected $casts = [
        'periode' => 'date',
        'periode_awal' => 'date',
        'periode_akhir' => 'date',
        'nilai_peramalan' => 'integer',
        'alpha' => 'float',
        'mad' => 'float',
        'mse' => 'float',
    ];

    protected $with = ['produk'];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'produk_id');
    }
}
