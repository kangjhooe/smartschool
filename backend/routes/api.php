<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\GuruController;
use App\Http\Controllers\API\KelasController;
use App\Http\Controllers\API\SekolahController;
use App\Http\Controllers\API\SiswaController;
use App\Http\Controllers\API\SuperAdminController;
use Illuminate\Support\Facades\Route;

// API Info route
Route::get('/', function () {
    return response()->json([
        'message' => 'SmartSchool API',
        'version' => '1.0.0',
        'status' => 'active',
        'endpoints' => [
            'authentication' => [
                'POST /api/register-sekolah' => 'Daftar sekolah baru',
                'POST /api/login' => 'Login pengguna',
                'POST /api/logout' => 'Logout (requires auth)',
                'GET /api/me' => 'Get current user (requires auth)',
            ],
            'sekolah' => [
                'GET /api/sekolah' => 'Get data sekolah (requires auth)',
                'PUT /api/sekolah' => 'Update data sekolah (requires auth)',
            ],
            'guru' => [
                'GET /api/guru' => 'List semua guru (requires auth)',
                'POST /api/guru' => 'Tambah guru baru (requires auth)',
                'GET /api/guru/{id}' => 'Get detail guru (requires auth)',
                'PUT /api/guru/{id}' => 'Update guru (requires auth)',
                'DELETE /api/guru/{id}' => 'Hapus guru (requires auth)',
            ],
            'siswa' => [
                'GET /api/siswa' => 'List semua siswa (requires auth)',
                'POST /api/siswa' => 'Tambah siswa baru (requires auth)',
                'GET /api/siswa/{id}' => 'Get detail siswa (requires auth)',
                'PUT /api/siswa/{id}' => 'Update siswa (requires auth)',
                'DELETE /api/siswa/{id}' => 'Hapus siswa (requires auth)',
            ],
            'kelas' => [
                'GET /api/kelas' => 'List semua kelas (requires auth)',
                'POST /api/kelas' => 'Tambah kelas baru (requires auth)',
                'GET /api/kelas/{id}' => 'Get detail kelas (requires auth)',
                'PUT /api/kelas/{id}' => 'Update kelas (requires auth)',
                'DELETE /api/kelas/{id}' => 'Hapus kelas (requires auth)',
                'POST /api/kelas/{id}/siswa' => 'Tambah siswa ke kelas (requires auth)',
                'DELETE /api/kelas/{id}/siswa/{siswaId}' => 'Hapus siswa dari kelas (requires auth)',
            ],
        ],
    ]);
});

// Public routes dengan rate limiting
Route::post('/register-sekolah', [AuthController::class, 'registerSekolah'])
    ->middleware('throttle:5,1'); // 5 requests per minute
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1'); // 5 requests per minute

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Super Admin routes (hanya untuk super_admin)
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        Route::get('/sekolah', [SuperAdminController::class, 'index']);
        Route::get('/sekolah/{id}', [SuperAdminController::class, 'show']);
        Route::put('/sekolah/{id}/status', [SuperAdminController::class, 'updateStatus']);
        Route::get('/sekolah/update-requests', [SuperAdminController::class, 'getUpdateRequests']);
        Route::put('/sekolah/update-requests/{id}/approve', [SuperAdminController::class, 'approveUpdateRequest']);
        Route::put('/sekolah/update-requests/{id}/reject', [SuperAdminController::class, 'rejectUpdateRequest']);
    });

    // Sekolah (untuk admin_sekolah) - menggunakan middleware sekolah.access
    Route::middleware('sekolah.access')->group(function () {
        Route::get('/sekolah', [SekolahController::class, 'show']);
        Route::put('/sekolah', [SekolahController::class, 'update']);
        Route::post('/sekolah/update-request', [SekolahController::class, 'requestUpdate']);
        Route::get('/sekolah/update-request', [SekolahController::class, 'getPendingRequest']);

        // Guru (untuk admin_sekolah)
        Route::apiResource('guru', GuruController::class);

        // Siswa (untuk admin_sekolah)
        Route::apiResource('siswa', SiswaController::class);

        // Kelas (untuk admin_sekolah)
        Route::apiResource('kelas', KelasController::class);
        Route::post('/kelas/{id}/siswa', [KelasController::class, 'attachSiswa']);
        Route::delete('/kelas/{id}/siswa/{siswaId}', [KelasController::class, 'detachSiswa']);
    });
});
