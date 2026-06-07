<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PenjualanController;
use App\Http\Controllers\PeramalanController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\RestockController;
use App\Http\Controllers\NotifikasiController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::get('/login', [LoginController::class, 'create'])
    ->middleware('guest')
    ->name('login');
Route::post('/login', [LoginController::class, 'store'])
    ->middleware('guest')
    ->name('login.store');
Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('dataproduk', [ProdukController::class, 'index'])->name('dataproduk');
    Route::middleware('role:Pemilik Usaha')->group(function () {
        Route::post('dataproduk', [ProdukController::class, 'store'])->name('dataproduk.store');
        Route::patch('dataproduk/{produk}', [ProdukController::class, 'update'])->name('dataproduk.update');
        Route::delete('dataproduk/{produk}', [ProdukController::class, 'destroy'])->name('dataproduk.destroy');
    });

    Route::get('datastok', [RestockController::class, 'index'])->name('datastok');
    Route::post('datastok', [RestockController::class, 'store'])->name('datastok.store');
    Route::patch('datastok/{stok}', [RestockController::class, 'update'])->name('datastok.update');
    Route::delete('datastok/{stok}', [RestockController::class, 'destroy'])->name('datastok.destroy');

    Route::get('datapenjualan', [PenjualanController::class, 'index'])->name('datapenjualan');
    Route::post('datapenjualan', [PenjualanController::class, 'store'])->name('datapenjualan.store');
    Route::patch('datapenjualan/{penjualan}', [PenjualanController::class, 'update'])->name('datapenjualan.update');
    Route::get('datapenjualan/check', [PenjualanController::class, 'checkRange'])->name('datapenjualan.check');
    Route::delete('datapenjualan/{penjualan}', [PenjualanController::class, 'destroy'])->name('datapenjualan.destroy');

    Route::get('api/notifikasi', [NotifikasiController::class, 'getLatest'])->name('notifikasi.index');
    Route::post('api/notifikasi/read-all', [NotifikasiController::class, 'markAllAsRead'])->name('notifikasi.read_all');
    Route::patch('api/notifikasi/{id}/read', [NotifikasiController::class, 'markAsRead'])->name('notifikasi.read');

    Route::post('profile/username', [PenggunaController::class, 'updateUsername'])->name('profile.username.update');
    Route::post('profile/photo', [PenggunaController::class, 'updateProfile'])->name('profile.photo.update');
    Route::delete('profile/photo', [PenggunaController::class, 'deleteProfile'])->name('profile.photo.delete');
});

Route::middleware(['auth', 'verified', 'role:Pemilik Usaha'])->group(function () {
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
