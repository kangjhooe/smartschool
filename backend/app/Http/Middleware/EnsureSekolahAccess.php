<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSekolahAccess
{
    /**
     * Handle an incoming request.
     * 
     * Middleware ini memastikan bahwa:
     * 1. User bukan super_admin (super_admin tidak bisa akses data internal sekolah)
     * 2. User memiliki instansi_id (terikat ke sekolah)
     * 3. Sekolah user aktif
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Super Admin tidak bisa akses data internal sekolah
        if ($user->role === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Super Admin tidak memiliki akses ke data internal sekolah',
            ], 403);
        }

        $instansiId = $user->instansi_id;
        
        if (!$instansiId) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak terikat ke sekolah manapun',
            ], 403);
        }

        // Cek apakah sekolah aktif
        $sekolah = $user->instansi;
        if (!$sekolah || !$sekolah->status) {
            return response()->json([
                'success' => false,
                'message' => 'Sekolah sedang dinonaktifkan',
            ], 403);
        }

        return $next($request);
    }
}
