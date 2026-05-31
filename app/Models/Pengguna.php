<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class Pengguna extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'pengguna_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'username',
        'password',
        'foto_profil'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'foto_profil_url',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function getFotoProfilUrlAttribute(): string
    {
        if ($this->foto_profil) {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('public');
            return $disk->url($this->foto_profil);
        }

        $name = urlencode($this->username);
        return "https://ui-avatars.com/api/?name={$name}&background=random&size=200";
    }
}
