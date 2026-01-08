<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuruRequest;
use App\Http\Requests\UpdateGuruRequest;
use App\Models\Guru;
use Illuminate\Http\Request;

class GuruController extends BaseController
{
    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId($request);
        
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $perPage = min(max(1, $perPage), 100); // Limit between 1-100
        
        $gurus = Guru::where('instansi_id', $instansiId)
            ->with(['user', 'instansi'])
            ->orderBy('nama_lengkap')
            ->paginate($perPage);

        return $this->successResponse($gurus);
    }

    public function store(StoreGuruRequest $request)
    {
        $instansiId = $this->getInstansiId($request);

        $guru = Guru::create([
            'instansi_id' => $instansiId,
            'nip' => $request->nip,
            'nama_lengkap' => $request->nama_lengkap,
            'jenis_kelamin' => $request->jenis_kelamin,
            'tanggal_lahir' => $request->tanggal_lahir,
            'alamat' => $request->alamat,
            'telepon' => $request->telepon,
        ]);

        return $this->successResponse(
            $guru->load(['user', 'instansi']),
            'Guru berhasil ditambahkan',
            201
        );
    }

    public function show(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $guru = Guru::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->with(['user', 'instansi', 'kelasWali'])
                ->firstOrFail();

            return $this->successResponse($guru);
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

    public function update(UpdateGuruRequest $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $guru = Guru::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $guru->update($request->only([
                'nip',
                'nama_lengkap',
                'jenis_kelamin',
                'tanggal_lahir',
                'alamat',
                'telepon',
            ]));

            return $this->successResponse(
                $guru->load(['user', 'instansi']),
                'Guru berhasil diperbarui'
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
            
            $guru = Guru::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $guru->delete();

            return $this->successResponse(null, 'Guru berhasil dihapus');
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
}
