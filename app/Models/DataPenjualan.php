<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataPenjualan extends Model
{
    use HasFactory;

    protected $table = 'data_penjualan';
    protected $primaryKey = 'penjualan_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'penjualan_id',
        'produk_id',
        'tanggal',
        'jumlah_terjual',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah_terjual' => 'integer',
    ];

    protected $with = ['produk'];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'produk_id');
    }
}
