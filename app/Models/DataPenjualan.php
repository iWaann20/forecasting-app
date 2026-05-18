<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataPenjualan extends Model
{
    use HasFactory;

    protected $table = 'data_penjualan';
    protected $primaryKey = 'penjualan_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'penjualan_id',
        'tanggal',
        'nama_produk',
        'jumlah_terjual',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'jumlah_terjual' => 'integer',
    ];

    // If you later add a products table, you can replace this with a relation.
}
