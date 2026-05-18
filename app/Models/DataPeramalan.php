<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPeramalan extends Model
{
    use HasFactory;

    protected $table = 'data_peramalan';
    protected $primaryKey = 'peramalan_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'peramalan_id',
        'periode_awal',
        'periode_akhir',
        'nama_produk',
        'nilai_peramalan',
        'alpha',
        'mad',
        'mse',
    ];

    protected $casts = [
        'periode_awal' => 'date',
        'periode_akhir' => 'date',
        'nilai_peramalan' => 'integer',
        'alpha' => 'float',
        'mad' => 'float',
        'mse' => 'float',
    ];
}
