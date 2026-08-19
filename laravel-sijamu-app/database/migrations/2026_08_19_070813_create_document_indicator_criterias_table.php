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
        Schema::create('document_indicator_criterias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('document_indicator_id');
            $table->string('label');
            $table->integer('bobot')->nullable();
            $table->text('kriteria')->nullable();
            $table->timestamps();

            $table->foreign('document_indicator_id')->references('id')->on('document_indicators')->onDelete('cascade');
        });

        // Seed default data for existing indicators
        $indicators = DB::table('document_indicators')->get();
        $defaults = [
            ['label' => 'Tidak Tersedia', 'bobot' => 0, 'kriteria' => 'Bukti, dokumen, data, atau informasi yang dipersyaratkan tidak tersedia sehingga indikator tidak dapat diverifikasi.'],
            ['label' => 'Tidak Sesuai', 'bobot' => 1, 'kriteria' => 'Bukti tersedia, namun belum memenuhi indikator, persyaratan, atau standar yang ditetapkan.'],
            ['label' => 'Sesuai', 'bobot' => 3, 'kriteria' => 'Bukti tersedia dan menunjukkan bahwa indikator telah memenuhi standar yang ditetapkan.'],
            ['label' => 'Melampaui', 'bobot' => 4, 'kriteria' => 'Bukti menunjukkan pencapaian yang melebihi standar, target, atau praktik baik yang dipersyaratkan.'],
            ['label' => 'N/A', 'bobot' => null, 'kriteria' => 'Indikator tidak relevan atau tidak berlaku pada unit yang diaudit sehingga tidak diperhitungkan dalam evaluasi.'],
            ['label' => 'Belum Dinilai', 'bobot' => null, 'kriteria' => 'Indikator, dokumen, atau bukti terkait belum diperiksa, dievaluasi, atau diverifikasi oleh auditor.']
        ];

        $inserts = [];
        foreach ($indicators as $ind) {
            foreach ($defaults as $def) {
                $inserts[] = [
                    'document_indicator_id' => $ind->id,
                    'label' => $def['label'],
                    'bobot' => $def['bobot'],
                    'kriteria' => $def['kriteria'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        
        // Insert chunks to avoid binding limits
        foreach (array_chunk($inserts, 100) as $chunk) {
            DB::table('document_indicator_criterias')->insert($chunk);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_indicator_criterias');
    }
};
