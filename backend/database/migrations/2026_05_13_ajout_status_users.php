<?php

// Exemple de migration Laravel
// Ajout d'un status pour validation admin

Schema::table('users', function (Blueprint $table) {
    $table->string('status')->default('en_attente');
});
