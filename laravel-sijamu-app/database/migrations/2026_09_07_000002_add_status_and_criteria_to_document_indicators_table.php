<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('document_indicator_criterias', function (Blueprint $table) {
            $table->string('status')->default('lolos')->after('kriteria'); // 'lolos' or 'revisi'
        });

        Schema::table('document_indicators', function (Blueprint $table) {
            $table->text('kriteria_lolos')->nullable()->after('help');
            $table->text('kriteria_revisi')->nullable()->after('kriteria_lolos');
        });

        // Update existing criteria based on standard labels
        DB::table('document_indicator_criterias')
            ->whereIn('label', ['Sesuai', 'Melampaui'])
            ->update(['status' => 'lolos']);

        DB::table('document_indicator_criterias')
            ->whereIn('label', ['Tidak Sesuai', 'Tidak Tersedia', 'N/A', 'Belum Dinilai'])
            ->update(['status' => 'revisi']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('document_indicator_criterias', function (Blueprint $table) {
            $table->dropColumn('status');
        });

        Schema::table('document_indicators', function (Blueprint $table) {
            $table->dropColumn(['kriteria_lolos', 'kriteria_revisi']);
        });
    }
};
