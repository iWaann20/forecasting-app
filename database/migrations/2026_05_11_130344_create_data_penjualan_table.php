<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_penjualan', function (Blueprint $table) {
            $table->uuid('penjualan_id')->primary();
            $table->date('tanggal');
            $table->string('nama_produk');
            $table->integer('jumlah_terjual');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_penjualan');
    }
};
