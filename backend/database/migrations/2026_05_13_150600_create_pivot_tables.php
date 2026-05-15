<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // S_inscrire : inscription d'un utilisateur à un module
        Schema::create('s_inscrire', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_module');
            $table->date('date_inscription')->nullable();
            $table->primary(['id_user', 'id_module']);

            $table->foreign('id_user')->references('id_user')->on('utilisateur_')->onDelete('cascade');
            $table->foreign('id_module')->references('id_module')->on('module_')->onDelete('cascade');
        });

        // Noter : note d'un utilisateur sur une évaluation
        Schema::create('noter', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user');
            $table->string('id_evaluation', 50);
            $table->decimal('valeur_note', 3, 2)->nullable();
            $table->primary(['id_user', 'id_evaluation']);

            $table->foreign('id_user')->references('id_user')->on('utilisateur_')->onDelete('cascade');
            $table->foreign('id_evaluation')->references('id_evaluation')->on('evaluation')->onDelete('cascade');
        });

        // composer : cours composant un module
        Schema::create('composer', function (Blueprint $table) {
            $table->unsignedBigInteger('id_module');
            $table->string('id_cours', 50);
            $table->primary(['id_module', 'id_cours']);

            $table->foreign('id_module')->references('id_module')->on('module_')->onDelete('cascade');
            $table->foreign('id_cours')->references('id_cours')->on('cours')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('composer');
        Schema::dropIfExists('noter');
        Schema::dropIfExists('s_inscrire');
    }
};
