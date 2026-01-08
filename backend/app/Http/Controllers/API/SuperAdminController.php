<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Sekolah;
use App\Models\SekolahUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SuperAdminController extends Controller
{
    /**
     * List semua sekolah (hanya untuk Super Admin)
     */
    public function index(Request $request)
    {
        try {
            $sekolahs = Sekolah::orderBy('nama')
                ->get();

            return response()->json($sekolahs);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detail sekolah (hanya untuk Super Admin)
     */
    public function show(Request $request, string $id)
    {
        try {
            $sekolah = Sekolah::with(['users', 'gurus', 'siswas', 'kelas'])
                ->findOrFail($id);

            return response()->json($sekolah);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update status sekolah (aktif/nonaktif)
     */
    public function updateStatus(Request $request, string $id)
    {
        try {
            $request->validate([
                'status' => 'required|boolean',
            ]);

            $sekolah = Sekolah::findOrFail($id);
            $sekolah->status = $request->status;
            $sekolah->save();

            return response()->json([
                'message' => $request->status ? 'Sekolah berhasil diaktifkan' : 'Sekolah berhasil dinonaktifkan',
                'sekolah' => $sekolah,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Sekolah tidak ditemukan',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List semua update requests
     */
    public function getUpdateRequests(Request $request)
    {
        try {
            $requests = SekolahUpdateRequest::with(['sekolah', 'approver'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($requests);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve update request
     */
    public function approveUpdateRequest(Request $request, string $id)
    {
        try {
            $updateRequest = SekolahUpdateRequest::findOrFail($id);

            if ($updateRequest->status !== 'pending') {
                return response()->json([
                    'message' => 'Request ini sudah diproses',
                ], 400);
            }

            DB::beginTransaction();

            // Update status request
            $updateRequest->status = 'approved';
            $updateRequest->approved_by = $request->user()->id;
            $updateRequest->save();

            // Update data sekolah (hanya NPSN dan Nama)
            $sekolah = $updateRequest->sekolah;
            $sekolah->npsn = $updateRequest->requested_npsn;
            $sekolah->nama = $updateRequest->requested_nama;
            $sekolah->save();

            DB::commit();

            return response()->json([
                'message' => 'Request berhasil disetujui dan data sekolah telah diperbarui',
                'request' => $updateRequest->load(['sekolah', 'approver']),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Request tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyetujui request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject update request
     */
    public function rejectUpdateRequest(Request $request, string $id)
    {
        try {
            $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $updateRequest = SekolahUpdateRequest::findOrFail($id);

            if ($updateRequest->status !== 'pending') {
                return response()->json([
                    'message' => 'Request ini sudah diproses',
                ], 400);
            }

            $updateRequest->status = 'rejected';
            $updateRequest->rejection_reason = $request->reason;
            $updateRequest->approved_by = $request->user()->id;
            $updateRequest->save();

            return response()->json([
                'message' => 'Request berhasil ditolak',
                'request' => $updateRequest->load(['sekolah', 'approver']),
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Request tidak ditemukan',
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menolak request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
