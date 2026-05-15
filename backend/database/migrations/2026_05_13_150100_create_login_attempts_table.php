<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table) {
            $table->id('Id');
            $table->unsignedBigInteger('id_user')->nullable();
            $table->string('ip_adresse', 50);
            $table->integer('AttemptCount')->default(0);
            $table->dateTime('LastAttemptAt')->nullable();
            $table->dateTime('LockedUntil')->nullable();

            $table->foreign('id_user')->references('id_user')->on('utilisateur_')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
