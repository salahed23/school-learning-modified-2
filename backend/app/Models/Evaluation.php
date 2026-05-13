<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modèle pour les Évaluations (Examens, Quiz, etc.)
 */
class Evaluation extends Model
{
    protected $fillable = ['titre', 'date_evaluation', 'type', 'module_id'];

    /**
     * Chaque évaluation appartient à un module spécifique.
     */
    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
