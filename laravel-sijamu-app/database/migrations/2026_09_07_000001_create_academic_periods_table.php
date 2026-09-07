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
        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Contoh: '2026/2027'
            $table->string('semester'); // 'Ganjil', 'Genap', 'Pendek'
            $table->boolean('is_current')->default(false);
            $table->dateTime('upload_deadline')->nullable();
            $table->timestamps();

            $table->unique(['name', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_periods');
    }
};
