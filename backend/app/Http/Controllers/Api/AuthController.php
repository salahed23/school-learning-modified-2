<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RefreshToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

class AuthController extends Controller
{
    const ACCESS_TOKEN_TTL = 15; // 15 minutes
    const REFRESH_TOKEN_TTL = 10080; // 7 jours
    const MAX_LOGIN_ATTEMPTS = 5; // 5 tentatives max
    const LOCKOUT_DURATION = 30; // Bloqué pour 30 secondes

    protected function guard(): JWTGuard
    {
        return Auth::guard('api');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Données invalides'], 422);
        }

        $throttleKey = 'login|' . strtolower($request->email) . '|' . $request->ip();

        // 1. Vérification du Brute Force (5 tentatives max)
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            
            // Note: Si tu dois absolument utiliser ta table LoginAttempts au lieu du RateLimiter natif, 
            // c'est ici qu'il faudrait faire l'INSERT/UPDATE dans ta base.
            
            return response()->json([
                'status'    => 'error',
                'message'   => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
                'retry_in'  => $seconds,
            ], 429);
        }

        $credentials = $validator->validated();
        $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
        $accessToken = $this->guard()->attempt($credentials);

        // 2. Échec de connexion
        if (!$accessToken) {
            RateLimiter::hit($throttleKey, self::LOCKOUT_DURATION); // Verrouillage de 30s après la 5eme
            $attemptsLeft = self::MAX_LOGIN_ATTEMPTS - RateLimiter::attempts($throttleKey);

            return response()->json([
                'error' => 'Email ou mot de passe incorrect.',
                'attempts_left' => max(0, $attemptsLeft),
            ], 401);
        }

        // 3. Succès de connexion
        RateLimiter::clear($throttleKey);

        $this->guard()->factory()->setTTL(self::REFRESH_TOKEN_TTL);
        $refreshTokenString = $this->guard()->refresh();
        
        $user = $this->guard()->user();

        // 4. Enregistrement du Refresh Token en Base de données (selon ton MLD)
        RefreshToken::create([
            'id_user'    => $user->id,
            'token_hash' => hash('sha256', $refreshTokenString),
            'CreateAt'   => now(),
            'ExpirerAt'  => now()->addMinutes(self::REFRESH_TOKEN_TTL),
            'RevokedAt'  => null
        ]);

        return response()->json([
            'access_token'  => $accessToken,
            'refresh_token' => $refreshTokenString,
            'token_type'    => 'bearer',
            'expires_in'    => self::ACCESS_TOKEN_TTL * 60,
        ]);
    }
}