<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            // Data minimal - NIK sebagai ID siswa
            // Set nullable dulu untuk kompatibilitas dengan data lama, akan diupdate via seeder atau manual
            $table->string('nik')->nullable()->after('id');
            
            // Tambahkan unique constraint setelah data diisi
            // Note: Unique constraint akan ditambahkan setelah data diisi semua
            
            // Data tambahan opsional
            $table->integer('tinggi_badan')->nullable()->after('tanggal_lahir');
            $table->integer('berat_badan')->nullable()->after('tinggi_badan');
            $table->text('data_disabilitas')->nullable()->after('berat_badan');
            $table->string('hobi')->nullable()->after('data_disabilitas');
            $table->string('cita_cita')->nullable()->after('hobi');
            $table->integer('jumlah_saudara_kandung')->nullable()->after('cita_cita');
            $table->integer('jumlah_saudara_tiri')->nullable()->after('jumlah_saudara_kandung');
            $table->string('nomor_kk')->nullable()->after('jumlah_saudara_tiri');
            
            // Data ayah kandung
            $table->string('nama_ayah')->nullable()->after('nomor_kk');
            $table->enum('status_ayah', ['Masih Hidup', 'Meninggal Dunia', 'Tidak Diketahui'])->nullable()->after('nama_ayah');
            $table->string('tempat_lahir_ayah')->nullable()->after('status_ayah');
            $table->date('tanggal_lahir_ayah')->nullable()->after('tempat_lahir_ayah');
            $table->string('pendidikan_ayah')->nullable()->after('tanggal_lahir_ayah');
            $table->string('pekerjaan_ayah')->nullable()->after('pendidikan_ayah');
            $table->text('alamat_ayah')->nullable()->after('pekerjaan_ayah');
            
            // Data ibu kandung
            $table->string('nama_ibu')->nullable()->after('alamat_ayah');
            $table->enum('status_ibu', ['Masih Hidup', 'Meninggal Dunia', 'Tidak Diketahui'])->nullable()->after('nama_ibu');
            $table->string('tempat_lahir_ibu')->nullable()->after('status_ibu');
            $table->date('tanggal_lahir_ibu')->nullable()->after('tempat_lahir_ibu');
            $table->string('pendidikan_ibu')->nullable()->after('tanggal_lahir_ibu');
            $table->string('pekerjaan_ibu')->nullable()->after('pendidikan_ibu');
            $table->text('alamat_ibu')->nullable()->after('pekerjaan_ibu');
            
            // Data wali
            $table->enum('wali_sama_dengan', ['Ayah Kandung', 'Ibu Kandung', 'Lainnya'])->nullable()->after('alamat_ibu');
            $table->string('nama_wali')->nullable()->after('wali_sama_dengan');
            $table->string('tempat_lahir_wali')->nullable()->after('nama_wali');
            $table->date('tanggal_lahir_wali')->nullable()->after('tempat_lahir_wali');
            $table->string('pendidikan_wali')->nullable()->after('tanggal_lahir_wali');
            $table->string('pekerjaan_wali')->nullable()->after('pendidikan_wali');
            $table->text('alamat_wali')->nullable()->after('pekerjaan_wali');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn([
                'nik',
                'tinggi_badan',
                'berat_badan',
                'data_disabilitas',
                'hobi',
                'cita_cita',
                'jumlah_saudara_kandung',
                'jumlah_saudara_tiri',
                'nomor_kk',
                'nama_ayah',
                'status_ayah',
                'tempat_lahir_ayah',
                'tanggal_lahir_ayah',
                'pendidikan_ayah',
                'pekerjaan_ayah',
                'alamat_ayah',
                'nama_ibu',
                'status_ibu',
                'tempat_lahir_ibu',
                'tanggal_lahir_ibu',
                'pendidikan_ibu',
                'pekerjaan_ibu',
                'alamat_ibu',
                'wali_sama_dengan',
                'nama_wali',
                'tempat_lahir_wali',
                'tanggal_lahir_wali',
                'pendidikan_wali',
                'pekerjaan_wali',
                'alamat_wali',
            ]);
        });
    }
};
