<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Modèle pour les Cours.
 * C'est l'unité de base de l'apprentissage dans ma plateforme.
 */
class Course extends Model
{
    protected $fillable = ['titre', 'contenu', 'duree'];

    /**
     * Relation inverse Many-to-Many avec les Modules.
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class);
    }
}
