<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modèle pour le Planning (Emploi du temps)
 */
class Planning extends Model
{
    protected $fillable = ['date_debut', 'date_fin', 'salle', 'module_id'];

    /**
     * Un élément de planning concerne un module particulier.
     */
    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
