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
        Schema::table('sekolah_update_requests', function (Blueprint $table) {
            if (Schema::hasColumn('sekolah_update_requests', 'requested_tahun_berdiri')) {
                $table->dropColumn('requested_tahun_berdiri');
            }
            if (Schema::hasColumn('sekolah_update_requests', 'requested_alamat')) {
                $table->dropColumn('requested_alamat');
            }
            if (Schema::hasColumn('sekolah_update_requests', 'requested_provinsi')) {
                $table->dropColumn('requested_provinsi');
            }
            if (Schema::hasColumn('sekolah_update_requests', 'requested_kabupaten')) {
                $table->dropColumn('requested_kabupaten');
            }
            if (Schema::hasColumn('sekolah_update_requests', 'requested_kecamatan')) {
                $table->dropColumn('requested_kecamatan');
            }
            if (Schema::hasColumn('sekolah_update_requests', 'requested_kelurahan')) {
                $table->dropColumn('requested_kelurahan');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sekolah_update_requests', function (Blueprint $table) {
            $table->string('requested_tahun_berdiri')->nullable()->after('requested_nama');
            $table->text('requested_alamat')->nullable()->after('requested_tahun_berdiri');
            $table->string('requested_provinsi')->nullable()->after('requested_alamat');
            $table->string('requested_kabupaten')->nullable()->after('requested_provinsi');
            $table->string('requested_kecamatan')->nullable()->after('requested_kabupaten');
            $table->string('requested_kelurahan')->nullable()->after('requested_kecamatan');
        });
    }
};
