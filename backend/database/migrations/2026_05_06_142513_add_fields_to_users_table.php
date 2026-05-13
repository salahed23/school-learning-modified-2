<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration pour personnaliser la table users.
 * J'ai remplacé le champ 'name' par 'first_name' et 'last_name',
 * et j'ai ajouté la gestion des rôles (Admin, Enseignant, Etudiant).
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->after('id');
            $table->string('last_name')->after('first_name');
            // Le rôle par défaut est 'Etudiant'
            $table->enum('role', ['Admin', 'Enseignant', 'Etudiant'])->default('Etudiant')->after('email');
            $table->dropColumn('name'); // On supprime l'ancien champ 'name' par défaut de Laravel
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->dropColumn(['first_name', 'last_name', 'role']);
        });
    }
};

