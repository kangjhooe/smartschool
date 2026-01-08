<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function registerSekolah(Request $request)
    {
        try {
            $request->validate([
                'npsn' => 'required|string|size:8|unique:sekolah,npsn',
                'jenjang' => 'required|in:SD/MI,SMP/MTs,SMA/MA,SMK/MAK',
                'status_sekolah' => 'required|in:Negeri,Swasta',
                'nama_sekolah' => 'required|string|max:255',
                'email_sekolah' => 'required|email|max:255|unique:users,email',
                'name' => 'required|string|max:255',
                'no_wa' => 'required|string|max:20',
                'password' => 'required|string|min:8|confirmed',
            ]);

            // Buat sekolah (default status aktif)
            $sekolah = Sekolah::create([
                'npsn' => $request->npsn,
                'jenjang' => $request->jenjang,
                'status_sekolah' => $request->status_sekolah,
                'nama' => $request->nama_sekolah,
                'email' => $request->email_sekolah,
                'status' => true, // Default aktif saat registrasi
            ]);

            // Buat user admin sekolah
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email_sekolah, // Admin login menggunakan email sekolah
                'no_wa' => $request->no_wa,
                'password' => Hash::make($request->password),
                'role' => 'admin_sekolah',
                'instansi_id' => $sekolah->id,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Sekolah berhasil didaftarkan',
                'data' => [
                    'user' => $user->load('instansi'),
                    'token' => $token,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exception akan di-handle oleh custom exception handler
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            // Biarkan exception handler yang menangani
            throw $e;
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|string',
                'password' => 'required',
            ]);

            $loginInput = trim($request->email);
            $user = null;

            // Cek apakah input adalah email atau NPSN
            if (filter_var($loginInput, FILTER_VALIDATE_EMAIL)) {
                // Jika email, cari user langsung (case insensitive)
                $user = User::whereRaw('LOWER(email) = ?', [strtolower($loginInput)])->first();
            } else {
                // Jika bukan email, anggap sebagai NPSN
                // Cari sekolah berdasarkan NPSN
                $sekolah = Sekolah::where('npsn', $loginInput)->first();
                
                if ($sekolah) {
                    // Cari admin sekolah yang terkait dengan sekolah ini
                    $user = User::where('instansi_id', $sekolah->id)
                        ->where('role', 'admin_sekolah')
                        ->first();
                }
            }

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email/NPSN atau password salah',
                ], 401);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email/NPSN atau password salah',
                ], 401);
            }

            // Cek status sekolah untuk admin_sekolah
            if ($user->role === 'admin_sekolah' && $user->instansi) {
                if (!$user->instansi->status) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Sekolah sedang dinonaktifkan. Silakan hubungi administrator.',
                    ], 403);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => $user->load('instansi'),
                    'token' => $token,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Validation exception akan di-handle oleh custom exception handler
            throw $e;
        } catch (\Exception $e) {
            // Biarkan exception handler yang menangani
            throw $e;
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()->load('instansi'),
            ],
        ]);
    }
}
