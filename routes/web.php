<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store'])->name('login.store');
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::get('dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])
    ->name('dashboard');
Route::get('datapenjualan', function () {
    return Inertia::render('datapenjualan');
})->middleware(['auth', 'verified'])->name('datapenjualan');
Route::get('dataparamalan', function () {
    return Inertia::render('dataparamalan');
})->middleware(['auth', 'verified'])->name('dataparamalan');

require __DIR__.'/settings.php';
