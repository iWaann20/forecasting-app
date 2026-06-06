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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->uuid('notif_id')->primary();
            $table->string('judul');
            $table->uuid('pengguna_id');
            $table->foreign('pengguna_id')->references('pengguna_id')->on('pengguna')->onDelete('cascade');
            $table->string('tipe_notifikasi');
            $table->string('pesan', 500);
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->boolean('status_baca')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
