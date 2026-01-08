<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSiswaRequest;
use App\Http\Requests\UpdateSiswaRequest;
use App\Models\Siswa;
use Illuminate\Http\Request;

class SiswaController extends BaseController
{
    public function index(Request $request)
    {
        $instansiId = $this->getInstansiId($request);
        
        $perPage = $request->get('per_page', 15); // Default 15 items per page
        $perPage = min(max(1, $perPage), 100); // Limit between 1-100
        
        $siswas = Siswa::where('instansi_id', $instansiId)
            ->with(['user', 'instansi', 'kelas'])
            ->orderBy('nama_lengkap')
            ->paginate($perPage);

        return $this->successResponse($siswas);
    }

    public function store(Request $request)
    {
        try {
            $instansiId = $this->getInstansiId($request);

            $request->validate([
                'nik' => 'required|string|max:255|unique:siswa,nik',
                'nisn' => 'nullable|string|max:255',
                'nama_lengkap' => 'required|string|max:255',
                'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
                'tanggal_lahir' => 'required|date',
                'alamat' => 'nullable|string',
                'telepon' => 'nullable|string|max:20',
                'tinggi_badan' => 'nullable|integer|min:0',
                'berat_badan' => 'nullable|integer|min:0',
                'data_disabilitas' => 'nullable|string',
                'hobi' => 'nullable|string|max:255',
                'cita_cita' => 'nullable|string|max:255',
                'jumlah_saudara_kandung' => 'nullable|integer|min:0',
                'jumlah_saudara_tiri' => 'nullable|integer|min:0',
                'nomor_kk' => 'nullable|string|max:255',
                'nama_ayah' => 'nullable|string|max:255',
                'status_ayah' => 'nullable|in:Masih Hidup,Meninggal Dunia,Tidak Diketahui',
                'tempat_lahir_ayah' => 'nullable|string|max:255',
                'tanggal_lahir_ayah' => 'nullable|date',
                'pendidikan_ayah' => 'nullable|string|max:255',
                'pekerjaan_ayah' => 'nullable|string|max:255',
                'alamat_ayah' => 'nullable|string',
                'nama_ibu' => 'nullable|string|max:255',
                'status_ibu' => 'nullable|in:Masih Hidup,Meninggal Dunia,Tidak Diketahui',
                'tempat_lahir_ibu' => 'nullable|string|max:255',
                'tanggal_lahir_ibu' => 'nullable|date',
                'pendidikan_ibu' => 'nullable|string|max:255',
                'pekerjaan_ibu' => 'nullable|string|max:255',
                'alamat_ibu' => 'nullable|string',
                'wali_sama_dengan' => 'nullable|in:Ayah Kandung,Ibu Kandung,Lainnya',
                'nama_wali' => 'nullable|string|max:255',
                'tempat_lahir_wali' => 'nullable|string|max:255',
                'tanggal_lahir_wali' => 'nullable|date',
                'pendidikan_wali' => 'nullable|string|max:255',
                'pekerjaan_wali' => 'nullable|string|max:255',
                'alamat_wali' => 'nullable|string',
            ]);

            $siswa = Siswa::create([
                'instansi_id' => $instansiId,
                'nik' => $request->nik,
                'nisn' => $request->nisn,
                'nama_lengkap' => $request->nama_lengkap,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'alamat' => $request->alamat,
                'telepon' => $request->telepon,
                'tinggi_badan' => $request->tinggi_badan,
                'berat_badan' => $request->berat_badan,
                'data_disabilitas' => $request->data_disabilitas,
                'hobi' => $request->hobi,
                'cita_cita' => $request->cita_cita,
                'jumlah_saudara_kandung' => $request->jumlah_saudara_kandung,
                'jumlah_saudara_tiri' => $request->jumlah_saudara_tiri,
                'nomor_kk' => $request->nomor_kk,
                'nama_ayah' => $request->nama_ayah,
                'status_ayah' => $request->status_ayah,
                'tempat_lahir_ayah' => $request->tempat_lahir_ayah,
                'tanggal_lahir_ayah' => $request->tanggal_lahir_ayah,
                'pendidikan_ayah' => $request->pendidikan_ayah,
                'pekerjaan_ayah' => $request->pekerjaan_ayah,
                'alamat_ayah' => $request->alamat_ayah,
                'nama_ibu' => $request->nama_ibu,
                'status_ibu' => $request->status_ibu,
                'tempat_lahir_ibu' => $request->tempat_lahir_ibu,
                'tanggal_lahir_ibu' => $request->tanggal_lahir_ibu,
                'pendidikan_ibu' => $request->pendidikan_ibu,
                'pekerjaan_ibu' => $request->pekerjaan_ibu,
                'alamat_ibu' => $request->alamat_ibu,
                'wali_sama_dengan' => $request->wali_sama_dengan,
                'nama_wali' => $request->nama_wali,
                'tempat_lahir_wali' => $request->tempat_lahir_wali,
                'tanggal_lahir_wali' => $request->tanggal_lahir_wali,
                'pendidikan_wali' => $request->pendidikan_wali,
                'pekerjaan_wali' => $request->pekerjaan_wali,
                'alamat_wali' => $request->alamat_wali,
            ]);

        return $this->successResponse(
            $siswa->load(['user', 'instansi']),
            'Siswa berhasil ditambahkan',
            201
        );
    }

    public function show(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $siswa = Siswa::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->with(['user', 'instansi', 'kelas'])
                ->firstOrFail();

            return response()->json($siswa);
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

    public function update(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $siswa = Siswa::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $request->validate([
                'nik' => 'required|string|max:255|unique:siswa,nik,' . $id,
                'nisn' => 'nullable|string|max:255',
                'nama_lengkap' => 'required|string|max:255',
                'jenis_kelamin' => 'required|in:Laki-laki,Perempuan',
                'tanggal_lahir' => 'required|date',
                'alamat' => 'nullable|string',
                'telepon' => 'nullable|string|max:20',
                'tinggi_badan' => 'nullable|integer|min:0',
                'berat_badan' => 'nullable|integer|min:0',
                'data_disabilitas' => 'nullable|string',
                'hobi' => 'nullable|string|max:255',
                'cita_cita' => 'nullable|string|max:255',
                'jumlah_saudara_kandung' => 'nullable|integer|min:0',
                'jumlah_saudara_tiri' => 'nullable|integer|min:0',
                'nomor_kk' => 'nullable|string|max:255',
                'nama_ayah' => 'nullable|string|max:255',
                'status_ayah' => 'nullable|in:Masih Hidup,Meninggal Dunia,Tidak Diketahui',
                'tempat_lahir_ayah' => 'nullable|string|max:255',
                'tanggal_lahir_ayah' => 'nullable|date',
                'pendidikan_ayah' => 'nullable|string|max:255',
                'pekerjaan_ayah' => 'nullable|string|max:255',
                'alamat_ayah' => 'nullable|string',
                'nama_ibu' => 'nullable|string|max:255',
                'status_ibu' => 'nullable|in:Masih Hidup,Meninggal Dunia,Tidak Diketahui',
                'tempat_lahir_ibu' => 'nullable|string|max:255',
                'tanggal_lahir_ibu' => 'nullable|date',
                'pendidikan_ibu' => 'nullable|string|max:255',
                'pekerjaan_ibu' => 'nullable|string|max:255',
                'alamat_ibu' => 'nullable|string',
                'wali_sama_dengan' => 'nullable|in:Ayah Kandung,Ibu Kandung,Lainnya',
                'nama_wali' => 'nullable|string|max:255',
                'tempat_lahir_wali' => 'nullable|string|max:255',
                'tanggal_lahir_wali' => 'nullable|date',
                'pendidikan_wali' => 'nullable|string|max:255',
                'pekerjaan_wali' => 'nullable|string|max:255',
                'alamat_wali' => 'nullable|string',
            ]);

            $siswa->update($request->only([
                'nik',
                'nisn',
                'nama_lengkap',
                'jenis_kelamin',
                'tanggal_lahir',
                'alamat',
                'telepon',
                'tinggi_badan',
                'berat_badan',
                'data_disabilitas',
                'hobi',
                'cita_cita',
                'jumlah_saudara_kandung',
                'jumlah_saudara_tiri',
                'nomor_kk',
                'nama_ayah',
                'status_ayah',
                'tempat_lahir_ayah',
                'tanggal_lahir_ayah',
                'pendidikan_ayah',
                'pekerjaan_ayah',
                'alamat_ayah',
                'nama_ibu',
                'status_ibu',
                'tempat_lahir_ibu',
                'tanggal_lahir_ibu',
                'pendidikan_ibu',
                'pekerjaan_ibu',
                'alamat_ibu',
                'wali_sama_dengan',
                'nama_wali',
                'tempat_lahir_wali',
                'tanggal_lahir_wali',
                'pendidikan_wali',
                'pekerjaan_wali',
                'alamat_wali',
            ]));

        return $this->successResponse(
            $siswa->load(['user', 'instansi']),
            'Siswa berhasil diperbarui'
        );
    }

    public function destroy(Request $request, string $id)
    {
        try {
            $instansiId = $this->getInstansiId($request);
            
            $siswa = Siswa::where('instansi_id', $instansiId)
                ->where('id', $id)
                ->firstOrFail();

            $siswa->delete();

            return response()->json([
                'message' => 'Siswa berhasil dihapus',
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
}
