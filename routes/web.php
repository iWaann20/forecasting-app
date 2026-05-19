<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PenjualanController;
use App\Http\Controllers\PeramalanController;

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
Route::get('datapenjualan', [PenjualanController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('datapenjualan');
Route::post('datapenjualan', [PenjualanController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('datapenjualan.store');
Route::delete('datapenjualan/{penjualan}', [PenjualanController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('datapenjualan.destroy');
Route::get('dataperamalan', [PeramalanController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dataperamalan');
Route::post('dataperamalan/hitung', [PeramalanController::class, 'hitung'])
    ->middleware(['auth', 'verified'])
    ->name('dataperamalan.hitung');
Route::delete('dataperamalan/{peramalan}', [PeramalanController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('dataperamalan.destroy');

require __DIR__.'/settings.php';
