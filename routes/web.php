<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShareController;
use App\Support\ShareRetention;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Home', [
    'retentionLabels' => ShareRetention::allLabels(),
]))->name('home');
Route::get('/create', [ShareController::class, 'index'])->name('shares.index');
Route::post('/shares', [ShareController::class, 'store'])->name('shares.store');
Route::get('/shares/{share}/download', [ShareController::class, 'download'])->name('shares.download');
Route::get('/shares/{share}', [ShareController::class, 'show'])->name('shares.show');
Route::get('/legal', fn () => Inertia::render('Legal'))->name('legal');

Route::get('/dashboard', function () {
    return redirect()->route('shares.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
