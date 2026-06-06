<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataRestock extends Model
{
    use HasFactory;

    protected $table = 'data_restock';
    protected $primaryKey = 'restock_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'restock_id',
        'produk_id',
        'tanggal',
        'jumlah_restock',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah_restock' => 'integer',
    ];

    public function produk(): BelongsTo
    {
        return $this->belongsTo(Produk::class, 'produk_id', 'produk_id');
    }
}
