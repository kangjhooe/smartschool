<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Kelas extends Model
{
    protected $table = 'kelas';

    protected $fillable = [
        'instansi_id',
        'nama',
        'tingkat',
        'jurusan',
        'wali_kelas_id',
        'keterangan',
    ];

    // Relationships
    public function instansi(): BelongsTo
    {
        return $this->belongsTo(Sekolah::class, 'instansi_id');
    }

    public function waliKelas(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'wali_kelas_id');
    }

    public function siswa(): BelongsToMany
    {
        return $this->belongsToMany(Siswa::class, 'kelas_siswa', 'kelas_id', 'siswa_id')
            ->withPivot('tahun_ajaran', 'semester')
            ->withTimestamps();
    }
}
