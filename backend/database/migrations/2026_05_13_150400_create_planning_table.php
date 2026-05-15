<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planning', function (Blueprint $table) {
            $table->string('id_creneau', 50)->primary();
            $table->date('date_seance');
            $table->time('heure_debut');
            $table->string('salle', 50);
            $table->unsignedBigInteger('id_module');
            $table->timestamps();

            $table->foreign('id_module')->references('id_module')->on('module_')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planning');
    }
};
