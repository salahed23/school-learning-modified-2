<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modèle pour les Notes des étudiants.
 */
class Note extends Model
{
    // Règle de métier : Une note est comprise entre 0 et 20.
    protected $fillable = ['valeur', 'user_id', 'evaluation_id', 'commentaire'];

    /**
     * Chaque note appartient à un étudiant.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Chaque note est liée à une évaluation spécifique.
     */
    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class);
    }
}
