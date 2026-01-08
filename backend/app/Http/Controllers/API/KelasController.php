<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKelasRequest;
use App\Http\Requests\UpdateKelasRequest;
use App\Models\Kelas;
use Illuminate\Http\Request;

class KelasController extends BaseController
{
    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId($request);
        
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $perPage = min(max(1, $perPage), 100); // Limit between 1-100
        
        $kelas = Kelas::where('instansi_id', $instansiId)
            ->with(['instansi', 'waliKelas', 'siswa'])
            ->orderBy('nama')
            ->paginate($perPage);

        return $this->successResponse($kelas);
    }

    public function store(Request $request)
    {
        try {
            $instansiId = $this->getInstansiId($request);

            $request->validate([
                'nama' => 'required|string|max:255',
                'tingkat' => 'nullable|string|max:255',
                'jurusan' => 'nullable|string|max:255',
                'wali_kelas_id' => 'nullable|exists:guru,id',
                'keterangan' => 'nullable|string',
            ]);

            // Validasi wali_kelas_id harus dari instansi yang sama
            if ($request->wali_kelas_id) {
                $guru = \App\Models\Guru::where('id', $request->wali_kelas_id)
                    ->where('instansi_id', $instansiId)
                    ->first();
                
                if (!$guru) {
                    return response()->json([
                        'message' => 'Guru yang dipilih tidak ditemukan atau tidak terikat ke sekolah ini',
                    ], 422);
                }
            }

            $kelas = Kelas::create([
                'instansi_id' => $instansiId,
                'nama' => $request->nama,
                'tingkat' => $request->tingkat,
                'jurusan' => $request->jurusan,
                'wali_kelas_id' => $request->wali_kelas_id,
                'keterangan' => $request->keterangan,
            ]);

        return $this->successResponse(
            $kelas->load(['instansi', 'waliKelas']),
            'Kelas berhasil ditambahkan',
            201
        );
    }

    public function show(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $kelas = Kelas::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->with(['instansi', 'waliKelas', 'siswa'])
                ->firstOrFail();

            return response()->json($kelas);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Data tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function update(UpdateKelasRequest $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $kelas = Kelas::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $kelas->update($request->only([
                    'nama',
                    'tingkat',
                    'jurusan',
                    'wali_kelas_id',
                    'keterangan',
                ]));

            return $this->successResponse(
                $kelas->load(['instansi', 'waliKelas']),
                'Kelas berhasil diperbarui'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Data tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $kelas = Kelas::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $kelas->delete();

            return response()->json([
                'message' => 'Kelas berhasil dihapus',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Data tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function attachSiswa(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $kelas = Kelas::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $request->validate([
                'siswa_id' => 'required|exists:siswa,id',
                'tahun_ajaran' => 'nullable|string',
                'semester' => 'nullable|in:ganjil,genap',
            ]);

            // Validasi siswa_id harus dari instansi yang sama
            $siswa = \App\Models\Siswa::where('id', $request->siswa_id)
                ->where('instansi_id', $instansiId)
                ->first();
            
            if (!$siswa) {
                return response()->json([
                    'message' => 'Siswa yang dipilih tidak ditemukan atau tidak terikat ke sekolah ini',
                ], 422);
            }

            $kelas->siswa()->attach($request->siswa_id, [
                'tahun_ajaran' => $request->tahun_ajaran,
                'semester' => $request->semester,
            ]);

            return response()->json([
                'message' => 'Siswa berhasil ditambahkan ke kelas',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Data tidak ditemukan',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menambah siswa ke kelas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function detachSiswa(Request $request, string $id, string $siswaId)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $kelas = Kelas::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $kelas->siswa()->detach($siswaId);

            return response()->json([
                'message' => 'Siswa berhasil dihapus dari kelas',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Data tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus siswa dari kelas',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
