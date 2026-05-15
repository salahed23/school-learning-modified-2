<?php

use App\Http\Controllers\Admin\AdminController;
use Illuminate\Support\Facades\Route;

// ── Page d'accueil ────────────────────────────────────────────────────────
Route::get('/', function () {
    return response()->json([
        'service' => 'school-learning API',
        'docs'    => url('/api/documentation'),
    ]);
});

// ── Page admin (JSON) — URL directe, non listée, protégée par middleware ──
Route::prefix('admin-secret-panel')
    ->middleware(['web', 'auth', \App\Http\Middleware\AdminSecretMiddleware::class])
    ->name('admin.')
    ->group(function () {
        Route::get('/',                    [AdminController::class, 'index'])->name('dashboard');
        Route::get('/users',               [AdminController::class, 'users'])->name('users');
        Route::patch('/users/{user}/role', [AdminController::class, 'updateRole'])->name('users.role');
        Route::delete('/users/{user}',     [AdminController::class, 'deleteUser'])->name('users.delete');
    });
