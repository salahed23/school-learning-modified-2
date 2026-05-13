<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * AdminSecretMiddleware
 *
 * Protège la route /admin-secret-panel :
 * - Non listée dans la navigation du site
 * - Accessible UNIQUEMENT par URL directe
 * - Requiert : être connecté + rôle Admin + IP whitelist optionnelle
 */
class AdminSecretMiddleware
{
    /**
     * IPs autorisées à accéder au panel admin.
     * Mettre à jour selon l'environnement de déploiement.
     * En dev, laisser vide [] pour désactiver la restriction IP.
     */
    private array $allowedIps = [
        // '127.0.0.1',
        // '::1',
        // Ajouter ici les IPs de production
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // 1. Vérification IP whitelist (si configurée)
        if (!empty($this->allowedIps) && !in_array($request->ip(), $this->allowedIps)) {
            Log::warning('[ADMIN] Tentative d\'accès depuis une IP non autorisée', [
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url'        => $request->url(),
            ]);
            abort(403, 'Accès refusé.');
        }

        // 2. Vérification de l'authentification (session Inertia/web)
        if (!Auth::check()) {
            Log::warning('[ADMIN] Tentative d\'accès admin sans authentification', [
                'ip' => $request->ip(),
            ]);
            return redirect()->route('login')->with('error', 'Accès réservé aux administrateurs.');
        }

        // 3. Vérification du rôle Admin
        if (Auth::user()->role !== 'Admin') {
            Log::warning('[ADMIN] Accès refusé — rôle insuffisant', [
                'user_id' => Auth::user()->id,
                'role'    => Auth::user()->role,
                'ip'      => $request->ip(),
            ]);
            abort(403, 'Accès réservé aux administrateurs.');
        }

        // 4. Log de l'accès admin réussi (traçabilité CNIL)
        Log::info('[ADMIN] Accès au panel admin', [
            'user_id' => Auth::user()->id,
            'email'   => Auth::user()->email,
            'ip'      => $request->ip(),
        ]);

        return $next($request);
    }
}
