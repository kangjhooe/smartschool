'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { sekolahService, SekolahUpdateRequest, Sekolah } from '@/lib/services';

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sekolah, setSekolah] = useState<Sekolah | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<SekolahUpdateRequest | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Form untuk update langsung (tanpa approval)
  const [formData, setFormData] = useState({
    tahun_berdiri: '',
    alamat: '',
    telepon: '',
    email: '',
    kepala_sekolah: '',
    jenjang: '',
    status_sekolah: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    kelurahan: '',
  });

  // Form untuk request approval (hanya NPSN dan Nama)
  const [approvalFormData, setApprovalFormData] = useState({
    npsn: '',
    nama: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin_sekolah') {
      loadSekolah();
      loadPendingRequest();
    }
  }, [user]);

  const loadSekolah = async () => {
    try {
      const data = await sekolahService.getSekolah();
      setSekolah(data);
      setFormData({
        tahun_berdiri: data.tahun_berdiri || '',
        alamat: data.alamat || '',
        telepon: data.telepon || '',
        email: (data.email || data.email_sekolah) || '',
        kepala_sekolah: data.kepala_sekolah || '',
        jenjang: data.jenjang || '',
        status_sekolah: data.status_sekolah || '',
        provinsi: data.provinsi || '',
        kabupaten: data.kabupaten || '',
        kecamatan: data.kecamatan || '',
        kelurahan: data.kelurahan || '',
      });
      setApprovalFormData({
        npsn: data.npsn || '',
        nama: data.nama || '',
      });
    } catch (error) {
      console.error('Error loading sekolah:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequest = async () => {
    try {
      const request = await sekolahService.getPendingRequest();
      setPendingRequest(request);
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Error loading pending request:', error);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setUpdating(true);

    try {
      await sekolahService.updateSekolah(formData);
      setSuccessMessage('Data sekolah berhasil diperbarui');
      loadSekolah();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error updating sekolah:', error);
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat memperbarui data';
        setErrors({ general: errorMessage });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    if (!approvalFormData.npsn || !approvalFormData.nama) {
      setErrors({ approval: 'NPSN dan Nama Sekolah harus diisi' });
      return;
    }

    if (pendingRequest && pendingRequest.status === 'pending') {
      setErrors({ approval: 'Anda sudah memiliki request yang sedang menunggu persetujuan' });
      return;
    }

    setSubmitting(true);
    try {
      await sekolahService.requestUpdate({
        npsn: approvalFormData.npsn,
        nama: approvalFormData.nama,
      });
      setSuccessMessage('Request perubahan NPSN dan Nama Sekolah berhasil dikirim. Menunggu persetujuan Super Admin.');
      loadPendingRequest();
      loadSekolah();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      if (error?.response?.status === 422 && error?.response?.data?.errors) {
        setErrors({ ...errors, ...error.response.data.errors });
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat mengirim request';
        setErrors({ approval: errorMessage });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Memuat...</div>
        </div>
      </Layout>
    );
  }

  if (!sekolah) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Data sekolah tidak ditemukan</div>
        </div>
      </Layout>
    );
  }

  const hasPendingRequest = pendingRequest && pendingRequest.status === 'pending';

  return (
    <Layout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profil Instansi</h1>
            <p className="text-gray-600 mt-1">Kelola data identitas sekolah Anda</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="bg-green-50 border-green-200 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="ml-auto flex-shrink-0 text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {errors.general && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800">{errors.general}</p>
              </div>
              <button
                onClick={() => setErrors({ ...errors, general: '' })}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </Card>
        )}

        {/* Status Request Approval */}
        {hasPendingRequest && (
          <Card className="bg-yellow-50 border-yellow-200 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Request Perubahan NPSN dan Nama Sekolah Sedang Menunggu Persetujuan
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Status: <span className="font-semibold capitalize">{pendingRequest.status}</span></p>
                  <p className="mt-1">Request dibuat: {new Date(pendingRequest.created_at).toLocaleString('id-ID')}</p>
                  {pendingRequest.status === 'rejected' && pendingRequest.rejection_reason && (
                    <p className="mt-1 text-red-600">Alasan ditolak: {pendingRequest.rejection_reason}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Form Update Langsung */}
        <Card className="mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sekolah</h2>
            <p className="text-sm text-gray-600">Update data sekolah yang dapat langsung diperbarui tanpa persetujuan</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* NPSN - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Statistik (NPSN)
                </label>
                <input
                  type="text"
                  value={sekolah.npsn || '-'}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Perubahan NPSN memerlukan persetujuan Super Admin</p>
              </div>

              {/* Nama Sekolah - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Sekolah
                </label>
                <input
                  type="text"
                  value={sekolah.nama || '-'}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm px-3 py-2 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Perubahan Nama Sekolah memerlukan persetujuan Super Admin</p>
              </div>

              {/* Jenjang */}
              <div>
                <label htmlFor="jenjang" className="block text-sm font-medium text-gray-700 mb-1">
                  Jenjang Pendidikan
                </label>
                <select
                  id="jenjang"
                  value={formData.jenjang}
                  onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                >
                  <option value="">Pilih Jenjang</option>
                  <option value="SD/MI">SD/MI</option>
                  <option value="SMP/MTs">SMP/MTs</option>
                  <option value="SMA/MA">SMA/MA</option>
                  <option value="SMK/MAK">SMK/MAK</option>
                </select>
                {errors.jenjang && <p className="mt-1 text-sm text-red-600">{errors.jenjang}</p>}
              </div>

              {/* Status Sekolah */}
              <div>
                <label htmlFor="status_sekolah" className="block text-sm font-medium text-gray-700 mb-1">
                  Status Sekolah
                </label>
                <select
                  id="status_sekolah"
                  value={formData.status_sekolah}
                  onChange={(e) => setFormData({ ...formData, status_sekolah: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                >
                  <option value="">Pilih Status</option>
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
                {errors.status_sekolah && <p className="mt-1 text-sm text-red-600">{errors.status_sekolah}</p>}
              </div>

              {/* Tahun Berdiri */}
              <div>
                <label htmlFor="tahun_berdiri" className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Berdiri
                </label>
                <input
                  type="number"
                  id="tahun_berdiri"
                  value={formData.tahun_berdiri}
                  onChange={(e) => setFormData({ ...formData, tahun_berdiri: e.target.value })}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Contoh: 1990"
                />
                {errors.tahun_berdiri && <p className="mt-1 text-sm text-red-600">{errors.tahun_berdiri}</p>}
              </div>

              {/* Telepon */}
              <div>
                <label htmlFor="telepon" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="telepon"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Contoh: 021-12345678"
                />
                {errors.telepon && <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Sekolah
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="sekolah@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Kepala Sekolah */}
              <div>
                <label htmlFor="kepala_sekolah" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  id="kepala_sekolah"
                  value={formData.kepala_sekolah}
                  onChange={(e) => setFormData({ ...formData, kepala_sekolah: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan nama kepala sekolah"
                />
                {errors.kepala_sekolah && <p className="mt-1 text-sm text-red-600">{errors.kepala_sekolah}</p>}
              </div>

              {/* Alamat */}
              <div className="sm:col-span-2">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan alamat lengkap sekolah"
                />
                {errors.alamat && <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>}
              </div>

              {/* Provinsi */}
              <div>
                <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  id="provinsi"
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan provinsi"
                />
                {errors.provinsi && <p className="mt-1 text-sm text-red-600">{errors.provinsi}</p>}
              </div>

              {/* Kabupaten */}
              <div>
                <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700 mb-1">
                  Kabupaten/Kota
                </label>
                <input
                  type="text"
                  id="kabupaten"
                  value={formData.kabupaten}
                  onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan kabupaten/kota"
                />
                {errors.kabupaten && <p className="mt-1 text-sm text-red-600">{errors.kabupaten}</p>}
              </div>

              {/* Kecamatan */}
              <div>
                <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  id="kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan kecamatan"
                />
                {errors.kecamatan && <p className="mt-1 text-sm text-red-600">{errors.kecamatan}</p>}
              </div>

              {/* Kelurahan */}
              <div>
                <label htmlFor="kelurahan" className="block text-sm font-medium text-gray-700 mb-1">
                  Kelurahan/Desa
                </label>
                <input
                  type="text"
                  id="kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                  placeholder="Masukkan kelurahan/desa"
                />
                {errors.kelurahan && <p className="mt-1 text-sm text-red-600">{errors.kelurahan}</p>}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={updating}
                loading={updating}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>

        {/* Form Request Approval (Hanya NPSN dan Nama) */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Perubahan NPSN dan Nama Sekolah</h2>
            <p className="text-sm text-gray-600">
              Perubahan NPSN dan Nama Sekolah memerlukan persetujuan Super Admin untuk menjaga integritas data.
            </p>
          </div>

          <form onSubmit={handleRequestApproval} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="approval_npsn" className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Statistik (NPSN) Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="approval_npsn"
                  value={approvalFormData.npsn}
                  onChange={(e) => setApprovalFormData({ ...approvalFormData, npsn: e.target.value })}
                  required
                  disabled={hasPendingRequest}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Masukkan NPSN baru"
                />
                {errors.npsn && <p className="mt-1 text-sm text-red-600">{errors.npsn}</p>}
              </div>

              <div>
                <label htmlFor="approval_nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Sekolah Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="approval_nama"
                  value={approvalFormData.nama}
                  onChange={(e) => setApprovalFormData({ ...approvalFormData, nama: e.target.value })}
                  required
                  disabled={hasPendingRequest}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Masukkan nama sekolah baru"
                />
                {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
              </div>
            </div>

            {errors.approval && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.approval}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting || hasPendingRequest}
                loading={submitting}
              >
                {hasPendingRequest ? 'Request Sedang Diproses' : 'Kirim Request Perubahan'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
