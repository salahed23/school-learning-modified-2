<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration RGPD/CNIL
 * Ajoute le consentement RGPD et le champ de verrouillage de compte
 * pour tracer les acceptations et les tentatives de brute force.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // RGPD — Consentement à la politique de confidentialité
            $table->boolean('rgpd_consent')->default(false)->after('role');
            $table->timestamp('rgpd_consent_at')->nullable()->after('rgpd_consent');

            // Sécurité — Verrouillage de compte après brute force
            $table->timestamp('locked_until')->nullable()->after('rgpd_consent_at');
            $table->integer('failed_login_count')->default(0)->after('locked_until');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['rgpd_consent', 'rgpd_consent_at', 'locked_until', 'failed_login_count']);
        });
    }
};
