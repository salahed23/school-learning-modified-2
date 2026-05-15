<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation', function (Blueprint $table) {
            $table->string('id_evaluation', 50)->primary();
            $table->string('titre_eval', 50);
            $table->string('type_eval', 50);
            $table->string('id_cours', 50);
            $table->timestamps();

            $table->foreign('id_cours')->references('id_cours')->on('cours')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation');
    }
};
