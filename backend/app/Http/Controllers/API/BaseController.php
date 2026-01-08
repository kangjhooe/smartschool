<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    /**
     * Cek apakah user memiliki akses ke data internal sekolah
     * Super Admin tidak memiliki akses ke data internal sekolah
     * 
     * @deprecated Gunakan middleware EnsureSekolahAccess sebagai gantinya
     */
    protected function checkAdminSekolahAccess(Request $request): ?JsonResponse
    {
        $user = $request->user();

        // Super Admin tidak bisa akses data internal sekolah
        if ($user->role === 'super_admin') {
            return $this->errorResponse('Super Admin tidak memiliki akses ke data internal sekolah', 403);
        }

        $instansiId = $user->instansi_id;
        
        if (!$instansiId) {
            return $this->errorResponse('Anda tidak terikat ke sekolah manapun', 403);
        }

        // Cek apakah sekolah aktif
        $sekolah = $user->instansi;
        if (!$sekolah || !$sekolah->status) {
            return $this->errorResponse('Sekolah sedang dinonaktifkan', 403);
        }

        return null;
    }

    /**
     * Get instansi_id dari user yang sudah divalidasi
     */
    protected function getInstansiId(Request $request): ?int
    {
        $user = $request->user();
        return $user->instansi_id;
    }

    /**
     * Return success response
     *
     * @param  mixed  $data
     * @param  string  $message
     * @param  int  $statusCode
     * @return JsonResponse
     */
    protected function successResponse($data = null, string $message = '', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Return error response
     *
     * @param  string  $message
     * @param  int  $statusCode
     * @param  array  $errors
     * @return JsonResponse
     */
    protected function errorResponse(string $message, int $statusCode = 400, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
