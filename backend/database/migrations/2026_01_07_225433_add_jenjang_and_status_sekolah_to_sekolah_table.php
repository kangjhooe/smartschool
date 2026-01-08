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
        Schema::table('sekolah', function (Blueprint $table) {
            $table->enum('jenjang', ['SD/MI', 'SMP/MTs', 'SMA/MA', 'SMK/MAK'])->nullable()->after('npsn');
            $table->enum('status_sekolah', ['Negeri', 'Swasta'])->nullable()->after('jenjang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sekolah', function (Blueprint $table) {
            $table->dropColumn(['jenjang', 'status_sekolah']);
        });
    }
};
