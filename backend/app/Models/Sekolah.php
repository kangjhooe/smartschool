<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sekolah extends Model
{
    protected $table = 'sekolah';

    protected $fillable = [
        'npsn',
        'jenjang',
        'status_sekolah',
        'nama',
        'alamat',
        'telepon',
        'email',
        'kepala_sekolah',
        'status',
        'tahun_berdiri',
        'provinsi',
        'kabupaten',
        'kecamatan',
        'kelurahan',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'instansi_id');
    }

    public function gurus(): HasMany
    {
        return $this->hasMany(Guru::class, 'instansi_id');
    }

    public function siswas(): HasMany
    {
        return $this->hasMany(Siswa::class, 'instansi_id');
    }

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class, 'instansi_id');
    }
}
