<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\SekolahUpdateRequest;
use Illuminate\Http\Request;

class SekolahController extends BaseController
{
    public function show(Request $request)
    {
        $sekolah = $request->user()->instansi;
        
        if (!$sekolah) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        }

        return response()->json($sekolah->load(['users', 'gurus', 'siswas', 'kelas']));
    }

    public function update(Request $request)
    {
        $sekolah = $request->user()->instansi;
        
        if (!$sekolah) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        }

        $request->validate([
            'tahun_berdiri' => 'nullable|string|max:4',
            'alamat' => 'nullable|string',
            'telepon' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'kepala_sekolah' => 'nullable|string|max:255',
            'jenjang' => 'nullable|in:SD/MI,SMP/MTs,SMA/MA,SMK/MAK',
            'status_sekolah' => 'nullable|in:Negeri,Swasta',
            'provinsi' => 'nullable|string|max:255',
            'kabupaten' => 'nullable|string|max:255',
            'kecamatan' => 'nullable|string|max:255',
            'kelurahan' => 'nullable|string|max:255',
        ]);

        $sekolah->update($request->only([
            'tahun_berdiri',
            'alamat',
            'telepon',
            'email',
            'kepala_sekolah',
            'jenjang',
            'status_sekolah',
            'provinsi',
            'kabupaten',
            'kecamatan',
            'kelurahan',
        ]));

        return response()->json([
            'message' => 'Data sekolah berhasil diperbarui',
            'sekolah' => $sekolah,
        ]);
    }

    public function requestUpdate(Request $request)
    {
        $sekolah = $request->user()->instansi;
        
        if (!$sekolah) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        }

        // Cek apakah ada request pending
        $pendingRequest = SekolahUpdateRequest::where('sekolah_id', $sekolah->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'message' => 'Anda sudah memiliki request yang sedang menunggu persetujuan',
            ], 400);
        }

        $request->validate([
            'npsn' => 'required|string|max:255',
            'nama' => 'required|string|max:255',
        ]);

        $updateRequest = SekolahUpdateRequest::create([
            'sekolah_id' => $sekolah->id,
            'requested_npsn' => $request->npsn,
            'requested_nama' => $request->nama,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Request perubahan data berhasil dikirim',
            'request' => $updateRequest,
        ], 201);
    }

    public function getPendingRequest(Request $request)
    {
        $sekolah = $request->user()->instansi;
        
        if (!$sekolah) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        }

        // Cari request pending dulu
        $updateRequest = SekolahUpdateRequest::where('sekolah_id', $sekolah->id)
            ->where('status', 'pending')
            ->first();

        // Jika tidak ada pending, ambil yang terakhir (approved/rejected)
        if (!$updateRequest) {
            $updateRequest = SekolahUpdateRequest::where('sekolah_id', $sekolah->id)
                ->whereIn('status', ['approved', 'rejected'])
                ->orderBy('created_at', 'desc')
                ->first();
        }

        if (!$updateRequest) {
            return response()->json([
                'message' => 'Tidak ada request yang ditemukan',
            ], 404);
        }

        return response()->json($updateRequest);
    }
}
