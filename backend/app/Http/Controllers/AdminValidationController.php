<?php

namespace App\Http\Controllers;

use App\Models\User;

class AdminValidationController extends Controller
{
    public function valider($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'valide';
        $user->save();

        return response()->json([
            'message' => 'Utilisateur validé'
        ]);
    }

    public function refuser($id)
    {
        $user = User::findOrFail($id);
        $user->status = 'refuse';
        $user->save();

        return response()->json([
            'message' => 'Utilisateur refusé'
        ]);
    }
}
