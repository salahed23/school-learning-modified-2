<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Modèle pour les Modules de formation.
 * Un module regroupe plusieurs cours.
 */
class Module extends Model
{
    protected $fillable = ['nom', 'description', 'coefficient'];

    /**
     * Relation Many-to-Many : Un module contient plusieurs cours.
     * Et un cours peut appartenir à plusieurs modules.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class);
    }
}
