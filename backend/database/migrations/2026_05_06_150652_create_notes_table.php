<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour la table des notes.
 * Respecte les règles de métier : lien étudiant, évaluation et valeur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            // Règle de métier : La note doit être comprise entre 0 et 20.
            $table->decimal('valeur', 4, 2); 
            $table->text('commentaire')->nullable();
            
            // Liens avec l'étudiant et l'évaluation
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
