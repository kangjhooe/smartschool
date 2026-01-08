<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Menambahkan index untuk meningkatkan performa query
     */
    public function up(): void
    {
        // Index untuk users table
        Schema::table('users', function (Blueprint $table) {
            // Index untuk role (sering di-filter)
            // Foreign key sudah otomatis membuat index untuk instansi_id
            $table->index('role');
        });

        // Index untuk sekolah table
        Schema::table('sekolah', function (Blueprint $table) {
            // Index untuk status (sering di-filter)
            // npsn sudah unique, otomatis ada index
            $table->index('status');
        });

        // Index untuk guru table
        Schema::table('guru', function (Blueprint $table) {
            // Index untuk nama_lengkap (sering di-sort dan di-search)
            // Foreign keys (user_id, instansi_id) sudah otomatis membuat index
            $table->index('nama_lengkap');
        });

        // Index untuk siswa table
        Schema::table('siswa', function (Blueprint $table) {
            // Unique index untuk nik (wajib unique, jika belum ada)
            // Foreign keys (user_id, instansi_id) sudah otomatis membuat index
            // Index untuk nama_lengkap (sering di-sort dan di-search)
            try {
                $table->unique('nik');
            } catch (\Exception $e) {
                // Unique constraint mungkin sudah ada, skip
            }
            $table->index('nama_lengkap');
        });

        // Index untuk kelas table
        Schema::table('kelas', function (Blueprint $table) {
            // Index untuk nama (sering di-sort)
            // Foreign keys (instansi_id, wali_kelas_id) sudah otomatis membuat index
            $table->index('nama');
        });

        // Index untuk kelas_siswa pivot table
        Schema::table('kelas_siswa', function (Blueprint $table) {
            // Composite index untuk query yang sering digunakan
            // Foreign keys (kelas_id, siswa_id) sudah otomatis membuat index
            $table->index(['kelas_id', 'siswa_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('sekolah', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('guru', function (Blueprint $table) {
            $table->dropIndex(['nama_lengkap']);
        });

        Schema::table('siswa', function (Blueprint $table) {
            try {
                $table->dropUnique(['nik']);
            } catch (\Exception $e) {
                // Unique constraint mungkin tidak ada, skip
            }
            $table->dropIndex(['nama_lengkap']);
        });

        Schema::table('kelas', function (Blueprint $table) {
            $table->dropIndex(['nama']);
        });

        Schema::table('kelas_siswa', function (Blueprint $table) {
            $table->dropIndex(['kelas_id', 'siswa_id']);
        });
    }
};
