<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifikasi extends Model
{
    use HasFactory;

    protected $table = 'notifikasi';
    protected $primaryKey = 'notif_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'notif_id',
        'judul',
        'pengguna_id',
        'tipe_notifikasi',
        'pesan',
        'reference_type',
        'reference_id',
        'status_baca',
    ];

    protected $casts = [
        'status_baca' => 'boolean',
    ];

    public function pengguna(): BelongsTo
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }
}
