<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminValidationController;

// Route admin accessible uniquement via URL

Route::prefix('administration-secrete')->group(function () {

    Route::post('/valider/{id}', [AdminValidationController::class, 'valider']);

    Route::post('/refuser/{id}', [AdminValidationController::class, 'refuser']);

});
