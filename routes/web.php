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
Route::get('datapenjualan/check', [PenjualanController::class, 'checkRange'])
    ->middleware(['auth', 'verified'])
    ->name('datapenjualan.check');
Route::delete('datapenjualan/{penjualan}', [PenjualanController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('datapenjualan.destroy');
Route::middleware(['auth', 'verified', 'role:pemilik'])->group(function () {
    Route::get('dataperamalan', [PeramalanController::class, 'index'])
        ->name('dataperamalan');
    Route::post('dataperamalan/hitung', [PeramalanController::class, 'hitung'])
        ->name('dataperamalan.hitung');
    Route::post('dataperamalan/preview/simpan', [PeramalanController::class, 'simpan'])
        ->name('dataperamalan.preview.simpan');
    Route::post('dataperamalan/preview/batal', [PeramalanController::class, 'batal'])
        ->name('dataperamalan.preview.batal');
    Route::post('dataperamalan/cetak/preview', [PeramalanController::class, 'cetakPreview'])
        ->name('dataperamalan.cetak.preview');
    Route::post('dataperamalan/cetak/batal', [PeramalanController::class, 'cetakBatal'])
        ->name('dataperamalan.cetak.batal');
    Route::get('dataperamalan/cetak', [PeramalanController::class, 'cetak'])
        ->name('dataperamalan.cetak');
    Route::delete('dataperamalan/{peramalan}', [PeramalanController::class, 'destroy'])
        ->name('dataperamalan.destroy');
});

require __DIR__.'/settings.php';
