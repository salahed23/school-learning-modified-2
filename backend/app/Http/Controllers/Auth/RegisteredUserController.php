<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Affiche la vue d'inscription (React/Inertia).
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Gère la création d'un utilisateur via le formulaire web.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Validation des données du formulaire web (Respect des règles CNIL).
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'role' => 'required|string|in:Etudiant,Enseignant',
            'password' => [
                'required', 
                'confirmed', 
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ], 
        ]);

        // Création de l'utilisateur avec son rôle spécifique.
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'role' => $request->role,
            'password' => Hash::make($request->password),
        ]);

        // Déclenchement de l'événement d'inscription.
        event(new Registered($user));

        // Connexion automatique après l'inscription.
        Auth::login($user);

        // Redirection vers le tableau de bord.
        return redirect(route('dashboard', absolute: false));
    }
}
