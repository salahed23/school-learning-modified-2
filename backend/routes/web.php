<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Routes Web — School-learning
|--------------------------------------------------------------------------
*/

// ── Page d'accueil ────────────────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Accueil', [
        'canLogin'      => Route::has('login'),
        'canRegister'   => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'    => PHP_VERSION,
    ]);
});

// ── Dashboard (protégé) ───────────────────────────────────────────────────
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// ── Profil utilisateur ────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile',    [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ── Politique de confidentialité (RGPD/CNIL) ─────────────────────────────
Route::get('/politique-confidentialite', function () {
    return Inertia::render('Legal/PrivacyPolicy');
})->name('privacy.policy');

// ══════════════════════════════════════════════════════════════════════════
// PAGE ADMIN — ACCESSIBLE UNIQUEMENT VIA URL DIRECTE
// Non listée dans la navigation, non référencée dans le code frontend.
// URL : /admin-secret-panel
// Protection : middleware AdminSecretMiddleware (auth + rôle Admin)
// ══════════════════════════════════════════════════════════════════════════
Route::prefix('admin-secret-panel')
    ->middleware(['web', 'auth', \App\Http\Middleware\AdminSecretMiddleware::class])
    ->name('admin.')
    ->group(function () {
        Route::get('/',                          [AdminController::class, 'index'])->name('dashboard');
        Route::get('/users',                     [AdminController::class, 'users'])->name('users');
        Route::patch('/users/{user}/role',       [AdminController::class, 'updateRole'])->name('users.role');
        Route::delete('/users/{user}',           [AdminController::class, 'deleteUser'])->name('users.delete');
    });
