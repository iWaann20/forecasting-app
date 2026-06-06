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
        Schema::create('data_peramalan', function (Blueprint $table) {
            $table->uuid('peramalan_id')->primary();
            $table->uuid('produk_id');
            $table->foreign('produk_id')->references('produk_id')->on('produk')->onDelete('cascade');
            $table->date('periode_awal');
            $table->date('periode_akhir');
            $table->integer('nilai_peramalan');
            $table->float('alpha');
            $table->float('mad')->nullable();
            $table->float('mse')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_peramalan');
    }
};
