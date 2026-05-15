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
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Authentication',
    description: 'API endpoints for user authentication'
)]
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

    protected function cookieOptions(): array
    {
        return [
            'path'     => '/',
            'domain'   => null,
            'secure'   => true,
            'httpOnly' => true,
            'sameSite' => 'none',
        ];
    }

    protected function issueTokenResponse(string $accessToken, string $refreshToken, User $user, int $status = 200)
    {
        $secure   = app()->environment('production');
        $sameSite = $secure ? 'none' : 'lax';

        return response()->json([
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type'    => 'bearer',
            'expires_in'    => self::ACCESS_TOKEN_TTL * 60,
            'user'          => $user,
        ], $status)
            ->cookie(cookie('token', $accessToken, self::ACCESS_TOKEN_TTL, '/', null, $secure, true, false, $sameSite))
            ->cookie(cookie('refresh_token', $refreshToken, self::REFRESH_TOKEN_TTL, '/', null, $secure, true, false, $sameSite));
    }

    protected function forgetAuthCookies(\Illuminate\Http\JsonResponse $response): \Illuminate\Http\JsonResponse
    {
        $secure   = app()->environment('production');
        $sameSite = $secure ? 'none' : 'lax';

        return $response
            ->cookie(cookie('token', '', -1, '/', null, $secure, true, false, $sameSite))
            ->cookie(cookie('refresh_token', '', -1, '/', null, $secure, true, false, $sameSite));
    }

    protected function getRefreshTokenFromRequest(Request $request): ?string
    {
        return $request->bearerToken() ?: $request->cookie('refresh_token');
    }

    protected function revokeRefreshToken(?string $token): void
    {
        if (!$token) {
            return;
        }

        $refresh = RefreshToken::where('token_hash', hash('sha256', $token))->first();
        if ($refresh) {
            $refresh->update(['RevokedAt' => now()]);
        }
    }

    #[OA\Post(
        path: '/api/auth/login',
        summary: 'User login',
        description: 'Authenticate user and return access and refresh tokens',
        operationId: 'login',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'user@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Login successful',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'access_token', type: 'string'),
                    new OA\Property(property: 'token_type', type: 'string', example: 'bearer'),
                    new OA\Property(property: 'expires_in', type: 'integer', example: 900),
                    new OA\Property(property: 'refresh_token', type: 'string'),
                ])
            ),
            new OA\Response(
                response: 401,
                description: 'Unauthorized',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'error', type: 'string', example: 'Unauthorized'),
                ])
            ),
            new OA\Response(
                response: 429,
                description: 'Too many attempts',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'status', type: 'string', example: 'error'),
                    new OA\Property(property: 'message', type: 'string'),
                    new OA\Property(property: 'retry_in', type: 'integer'),
                ])
            ),
        ]
    )]
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Données invalides'], 422);
        }

        $user = User::where('email', strtolower($request->email))->first();
        if (!$user) {
            return response()->json(['error' => 'L\'email n\'existe pas.'], 401);
        }

        $throttleKey = 'login|' . strtolower($request->email) . '|' . $request->ip();

        // 1. Vérification du Brute Force (5 tentatives max)
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

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

        /** @var \App\Models\User $user */
        $user = $this->guard()->user();

        RefreshToken::create([
            'id_user'    => $user->getKey(),
            'token_hash' => hash('sha256', $refreshTokenString),
            'CreateAt'   => now(),
            'ExpirerAt'  => now()->addMinutes(self::REFRESH_TOKEN_TTL),
            'RevokedAt'  => null,
        ]);

        return $this->issueTokenResponse($accessToken, $refreshTokenString, $user);
    }

    #[OA\Post(
        path: '/api/auth/register',
        summary: 'User registration',
        description: 'Create a new user account and return access and refresh tokens',
        operationId: 'register',
        tags: ['Authentication'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['first_name', 'last_name', 'email', 'password', 'password_confirmation', 'role'],
                properties: [
                    new OA\Property(property: 'first_name', type: 'string', example: 'Jean'),
                    new OA\Property(property: 'last_name', type: 'string', example: 'Dupont'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'jean.dupont@example.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'motdepasse123!'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'motdepasse123!'),
                    new OA\Property(property: 'role', type: 'string', enum: ['Etudiant', 'Enseignant'], example: 'Etudiant'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Registration successful',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'access_token', type: 'string'),
                    new OA\Property(property: 'token_type', type: 'string', example: 'bearer'),
                    new OA\Property(property: 'expires_in', type: 'integer', example: 900),
                    new OA\Property(property: 'refresh_token', type: 'string'),
                ])
            ),
            new OA\Response(
                response: 422,
                description: 'Validation error',
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: 'errors', type: 'object'),
                ])
            ),
        ]
    )]
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name'          => 'required|string|max:255',
            'last_name'           => 'required|string|max:255',
            'email'               => 'required|string|email|max:100|unique:utilisateur_,email',
            'password'            => 'required|string|min:12|confirmed',
            'role'                => 'required|in:Etudiant,Enseignant',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'prenom'       => strip_tags(trim($request->input('first_name'))),
            'nom_'         => strip_tags(trim($request->input('last_name'))),
            'email'        => strtolower(trim($request->input('email'))),
            'mot_de_passe' => $request->input('password'),
            'role'         => $request->input('role'),
        ]);

        $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
        $accessToken = $this->guard()->attempt($request->only('email', 'password'));

        if (!$accessToken) {
            return response()->json(['error' => 'Impossible de créer la session'], 500);
        }

        $this->guard()->factory()->setTTL(self::REFRESH_TOKEN_TTL);
        $refreshTokenString = $this->guard()->refresh();

        RefreshToken::create([
            'id_user'    => $user->getKey(),
            'token_hash' => hash('sha256', $refreshTokenString),
            'CreateAt'   => now(),
            'ExpirerAt'  => now()->addMinutes(self::REFRESH_TOKEN_TTL),
            'RevokedAt'  => null,
        ]);

        return $this->issueTokenResponse($accessToken, $refreshTokenString, $user, 201);
    }

    public function me()
    {
        return response()->json(['user' => $this->guard()->user()]);
    }

    public function logout(Request $request)
    {
        $refreshToken = $request->cookie('refresh_token') ?: $request->bearerToken();
        $this->revokeRefreshToken($refreshToken);

        $accessToken = $request->cookie('token') ?: $request->bearerToken();
        if ($accessToken) {
            try {
                $this->guard()->setToken($accessToken)->invalidate(true);
            } catch (\Exception) {
                // token déjà expiré ou invalide, on continue
            }
        }

        return $this->forgetAuthCookies(response()->json(['message' => 'Déconnecté avec succès']));
    }

    public function refresh(Request $request)
    {
        $refreshToken = $this->getRefreshTokenFromRequest($request);
        if (!$refreshToken) {
            return response()->json(['error' => 'Refresh token manquant'], 401);
        }

        $this->guard()->setToken($refreshToken);
        $this->guard()->factory()->setTTL(self::ACCESS_TOKEN_TTL);
        $token = $this->guard()->refresh();

        $secure   = app()->environment('production');
        $sameSite = $secure ? 'none' : 'lax';

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => self::ACCESS_TOKEN_TTL * 60,
        ])->cookie(cookie('token', $token, self::ACCESS_TOKEN_TTL, '/', null, $secure, true, false, $sameSite));
    }
}