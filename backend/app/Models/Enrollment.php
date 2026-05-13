<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modèle pour les Inscriptions (Lien entre Étudiant et Module).
 */
class Enrollment extends Model
{
    // Règle de métier : Un étudiant s'inscrit à un module pour y participer.
    protected $fillable = ['user_id', 'module_id', 'date_inscription', 'statut'];

    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
