<?php

namespace App\Http\Controllers;

use App\Models\Notifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotifikasiController extends Controller
{
    public function getLatest(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([]);
        }

        $notifikasi = Notifikasi::where('pengguna_id', $user->pengguna_id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $unreadCount = Notifikasi::where('pengguna_id', $user->pengguna_id)
            ->where('status_baca', false)
            ->count();

        return response()->json([
            'items' => $notifikasi,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        $user = $request->user();
        
        $notif = Notifikasi::where('pengguna_id', $user->pengguna_id)
            ->where('notif_id', $id)
            ->firstOrFail();

        $notif->update(['status_baca' => true]);

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notifikasi::where('pengguna_id', $user->pengguna_id)
            ->where('status_baca', false)
            ->update(['status_baca' => true]);

        return response()->json(['success' => true]);
    }
}
