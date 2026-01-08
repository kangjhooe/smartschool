<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use Illuminate\Http\Request;

class GuruController extends BaseController
{
    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId($request);
        
        $gurus = Guru::where('instansi_id', $instansiId)
            ->with(['user', 'instansi'])
            ->orderBy('nama_lengkap')
            ->get();

        return $this->successResponse($gurus);
    }

    public function store(Request $request)
    {
        $instansiId = $this->getInstansiId($request);

        $request->validate([
            'nip' => 'nullable|string|max:255',
            'nama_lengkap' => 'required|string|max:255',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
        ]);

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
        $instansiId = $this->getInstansiId($request);
        
        $guru = Guru::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->with(['user', 'instansi', 'kelasWali'])
            ->firstOrFail();

        return $this->successResponse($guru);
    }

    public function update(Request $request, string $id)
    {
        $instansiId = $this->getInstansiId($request);
        
        $guru = Guru::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'nip' => 'nullable|string|max:255',
            'nama_lengkap' => 'required|string|max:255',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
        ]);

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
    }

    public function destroy(Request $request, string $id)
    {
        $instansiId = $this->getInstansiId($request);
        
        $guru = Guru::where('instansi_id', $instansiId)
            ->where('id', $id)
            ->firstOrFail();

        $guru->delete();

        return $this->successResponse(null, 'Guru berhasil dihapus');
    }
}
