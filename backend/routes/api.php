<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API — School-learning
|--------------------------------------------------------------------------
| Architecture Token :
|   - Access Token  : 15 min, envoyé dans Authorization: Bearer <token>
|   - Refresh Token : 7 jours, envoyé dans Authorization: Bearer <refresh_token>
|                     Utilisé UNIQUEMENT sur /api/auth/refresh
*/

// Route de statut
Route::get('status', function () {
    return response()->json(['status' => 'ok', 'service' => 'school-backend']);
});

Route::group([
    'middleware' => 'api',
    'prefix'     => 'auth',
], function () {

    // ── Routes publiques (pas de token requis) ────────────────────────────
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);

    // ── Routes protégées (nécessitent un Access Token valide) ─────────────
    Route::middleware('auth:api')->group(function () {
        Route::post('me',      [AuthController::class, 'me']);
        Route::post('logout',  [AuthController::class, 'logout']);

        // ── Refresh Token ─────────────────────────────────────────────────
        // Le client envoie le Refresh Token ici pour obtenir un nouveau pair
        // de tokens (Access + Refresh). L'ancien Refresh Token est invalidé.
        Route::post('refresh', [AuthController::class, 'refresh']);
    });
});
