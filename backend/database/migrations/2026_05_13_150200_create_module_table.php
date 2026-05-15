<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_', function (Blueprint $table) {
            $table->id('id_module');
            $table->string('nom_module', 50);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('id_user');
            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('utilisateur_')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_');
    }
};
