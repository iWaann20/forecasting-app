<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produk extends Model
{
    use HasFactory;

    protected $table = 'produk';
    protected $primaryKey = 'produk_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'produk_id',
        'nama_produk',
        'stok',
        'stok_minimum',
    ];

    protected $casts = [
        'stok' => 'integer',
        'stok_minimum' => 'integer',
    ];

    public function penjualan(): HasMany
    {
        return $this->hasMany(DataPenjualan::class, 'produk_id', 'produk_id');
    }

    public function restock(): HasMany
    {
        return $this->hasMany(DataRestock::class, 'produk_id', 'produk_id');
    }

    public function peramalan(): HasMany
    {
        return $this->hasMany(DataPeramalan::class, 'produk_id', 'produk_id');
    }
}
