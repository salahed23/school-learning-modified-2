<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refresh_tokens', function (Blueprint $table) {
            $table->id('Id_token');
            $table->unsignedBigInteger('id_user');
            $table->string('token_hash', 255)->unique();
            $table->dateTime('CreateAt')->nullable();
            $table->dateTime('ExpirerAt')->nullable();
            $table->dateTime('RevokedAt')->nullable();

            $table->foreign('id_user')->references('id_user')->on('utilisateur_')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refresh_tokens');
    }
};
