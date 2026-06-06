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
        Schema::create('data_restock', function (Blueprint $table) {
            $table->uuid('restock_id')->primary();
            $table->uuid('produk_id');
            $table->foreign('produk_id')->references('produk_id')->on('produk')->onDelete('cascade');
            $table->date('tanggal');
            $table->integer('jumlah_restock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_restock');
    }
};
