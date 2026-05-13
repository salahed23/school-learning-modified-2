<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;

/**
 * AuthController - Gestion complète de l'authentification JWT
 *
 * Implémente :
 * - Access Token (courte durée, JWT signé)
 * - Refresh Token (longue durée, rotation à chaque refresh)
 * - Brute force protection (rate limiting + lockout progressif)
 * - Règles CNIL (mot de passe fort, logs de sécurité, consentement RGPD)
 */
class AuthController extends Controller
{
    /**
     * Durée du Access Token en minutes (15 min — courte durée pour la sécurité)
     */
    const ACCESS_TOKEN_TTL = 15;

    /**
     * Durée du Refresh Token en minutes (7 jours)
     */
    const REFRESH_TOKEN_TTL = 10080; // 7 * 24 * 60

    /**
     * Nombre max de tentatives de connexion avant lockout (CNIL recommande 5)
     */
    const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Durée du lockout en secondes (60 secondes)
     */
    const LOCKOUT_DURATION = 60;

    protected function guard(): JWTGuard
    {
        return Auth::guard('api');
    }

    // =========================================================================
    // CONNEXION — POST /api/auth/login
    // =========================================================================

    /**
     * Connexion avec protection anti-brute force et journalisation CNIL.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        // --- Validation des données entrantes ---
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Données invalides.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // --- Protection anti-brute force ---
        $throttleKey = $this->getThrottleKey($request);

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            // Log sécurité CNIL — tentative de brute force détectée
            Log::warning('[SECURITE] Compte verrouillé après plusieurs tentatives', [
                'email'      => $request->email,
                'ip'         => $request->ip(),
                'user_agent' => $request->userAgent(),
                'retry_in'   => $seconds . 's',
            ]);

            return response()->json([
                'status'    => 'error',
                'message'   => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
                'retry_in'  => $seconds,
            ], 429);
        }

        // --- Tentative d'authentification ---
        $credentials = $validator->validated();

        // On génère un Access Token de courte durée (15 min)
        $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
        $accessToken = $this->guard()->attempt($credentials);

        if (!$accessToken) {
            // Incrémenter le compteur de tentatives échouées
            RateLimiter::hit($throttleKey, self::LOCKOUT_DURATION);

            $attemptsLeft = self::MAX_LOGIN_ATTEMPTS - RateLimiter::attempts($throttleKey);

            // Log sécurité CNIL
            Log::info('[SECURITE] Échec de connexion', [
                'email'        => $request->email,
                'ip'           => $request->ip(),
                'attempts_left' => max(0, $attemptsLeft),
            ]);

            return response()->json([
                'status'        => 'error',
                'message'       => 'Email ou mot de passe incorrect.',
                'attempts_left' => max(0, $attemptsLeft),
            ], 401);
        }

        // Connexion réussie — on remet le compteur à zéro
        RateLimiter::clear($throttleKey);

        // Générer le Refresh Token avec une longue durée de vie
        $this->guard()->factory()->setTTL(self::REFRESH_TOKEN_TTL);
        $refreshToken = $this->guard()->refresh();

        // Log connexion réussie (traçabilité CNIL)
        Log::info('[SECURITE] Connexion réussie', [
            'user_id' => $this->guard()->user()->id,
            'email'   => $this->guard()->user()->email,
            'ip'      => $request->ip(),
        ]);

        return $this->respondWithTokens($accessToken, $refreshToken);
    }

    // =========================================================================
    // INSCRIPTION — POST /api/auth/register
    // =========================================================================

    /**
     * Inscription avec règles de mot de passe CNIL et consentement RGPD.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'           => 'required|string|max:255',
            'last_name'            => 'required|string|max:255',
            'email'                => 'required|string|email|max:255|unique:users',
            'role'                 => 'required|string|in:Etudiant,Enseignant',
            // CNIL — le mot de passe doit avoir : 12 car min, maj, min, chiffre, symbole
            'password'             => [
                'required',
                'string',
                'confirmed',
                Password::min(12)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            // RGPD — consentement obligatoire avant inscription
            'rgpd_consent'         => 'required|accepted',
        ], [
            'password.min'         => 'Le mot de passe doit contenir au moins 12 caractères (CNIL).',
            'password.mixed'       => 'Le mot de passe doit contenir des majuscules et des minuscules.',
            'password.numbers'     => 'Le mot de passe doit contenir au moins un chiffre.',
            'password.symbols'     => 'Le mot de passe doit contenir au moins un caractère spécial.',
            'rgpd_consent.accepted' => 'Vous devez accepter la politique de confidentialité (RGPD).',
            'role.in'              => 'Le rôle doit être Etudiant ou Enseignant.',
            'email.unique'         => 'Cet email est déjà utilisé.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Création de l'utilisateur
        $user = User::create([
            'first_name'     => $request->first_name,
            'last_name'      => $request->last_name,
            'email'          => $request->email,
            'role'           => $request->role,
            'password'       => Hash::make($request->password),
            'rgpd_consent'   => true,
            'rgpd_consent_at' => now(),
        ]);

        // Log création compte (CNIL — traçabilité)
        Log::info('[CNIL] Nouveau compte créé avec consentement RGPD', [
            'user_id'         => $user->id,
            'email'           => $user->email,
            'rgpd_consent_at' => now(),
        ]);

        // Génération des tokens pour connexion automatique après inscription
        $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
        $accessToken = $this->guard()->login($user);

        $this->guard()->factory()->setTTL(self::REFRESH_TOKEN_TTL);
        $refreshToken = $this->guard()->refresh();

        return $this->respondWithTokens($accessToken, $refreshToken, 201);
    }

    // =========================================================================
    // REFRESH TOKEN — POST /api/auth/refresh
    // =========================================================================

    /**
     * Échange un Refresh Token contre un nouveau pair de tokens.
     * Le Refresh Token est ROTATIF : l'ancien est invalidé immédiatement.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(Request $request)
    {
        try {
            // Rotation : le vieux token est invalidé, un nouveau Access Token est généré
            $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
            $newAccessToken = $this->guard()->refresh();

            // Nouveau Refresh Token rotatif
            $this->guard()->factory()->setTTL(self::REFRESH_TOKEN_TTL);
            $newRefreshToken = $this->guard()->refresh();

            Log::info('[SECURITE] Refresh Token utilisé — rotation effectuée', [
                'user_id' => $this->guard()->user()?->id,
                'ip'      => $request->ip(),
            ]);

            return $this->respondWithTokens($newAccessToken, $newRefreshToken);

        } catch (\Exception $e) {
            Log::warning('[SECURITE] Refresh Token invalide ou expiré', [
                'ip'    => $request->ip(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Token de rafraîchissement invalide ou expiré. Veuillez vous reconnecter.',
            ], 401);
        }
    }

    // =========================================================================
    // DÉCONNEXION — POST /api/auth/logout
    // =========================================================================

    /**
     * Déconnexion — invalide le token JWT côté serveur.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $userId = $this->guard()->user()?->id;
        $this->guard()->logout();

        Log::info('[SECURITE] Déconnexion', [
            'user_id' => $userId,
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Déconnexion réussie.',
        ]);
    }

    // =========================================================================
    // MON PROFIL — POST /api/auth/me
    // =========================================================================

    /**
     * Retourne les informations de l'utilisateur connecté.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json($this->guard()->user());
    }

    // =========================================================================
    // HELPERS PRIVÉS
    // =========================================================================

    /**
     * Construit la clé de throttle unique par IP + email.
     */
    private function getThrottleKey(Request $request): string
    {
        return 'login|' . strtolower($request->email) . '|' . $request->ip();
    }

    /**
     * Formate la réponse JSON avec Access Token + Refresh Token.
     *
     * @param string $accessToken
     * @param string $refreshToken
     * @param int    $statusCode
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithTokens(string $accessToken, string $refreshToken, int $statusCode = 200)
    {
        return response()->json([
            'status'        => 'success',
            // Access Token : courte durée (15 min), utilisé pour chaque requête API
            'access_token'  => $accessToken,
            'token_type'    => 'bearer',
            'expires_in'    => self::ACCESS_TOKEN_TTL * 60, // en secondes
            // Refresh Token : longue durée (7 jours), utilisé UNIQUEMENT pour renouveler l'access token
            'refresh_token' => $refreshToken,
            'refresh_expires_in' => self::REFRESH_TOKEN_TTL * 60, // en secondes
            'user'          => $this->guard()->user(),
        ], $statusCode);
    }
}
