'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { superAdminService, Sekolah } from '@/lib/services';

export default function SekolahPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sekolahs, setSekolahs] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSekolah, setSelectedSekolah] = useState<Sekolah | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'super_admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadSekolahs();
    }
  }, [user]);

  const loadSekolahs = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.getAllSekolah();
      setSekolahs(data);
    } catch (error) {
      console.error('Error loading sekolahs:', error);
      alert('Gagal memuat data sekolah');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const data = await superAdminService.getSekolahById(id);
      setSelectedSekolah(data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error loading detail:', error);
      alert('Gagal memuat detail sekolah');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (!confirm(`Apakah Anda yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} sekolah ini?`)) {
      return;
    }

    try {
      await superAdminService.updateSekolahStatus(id, !currentStatus);
      await loadSekolahs();
      if (selectedSekolah?.id === id) {
        setSelectedSekolah({ ...selectedSekolah, status: !currentStatus });
      }
      alert(`Sekolah berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Gagal memperbarui status sekolah');
    }
  };

  const filteredSekolahs = sekolahs.filter(sekolah => {
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && sekolah.status) ||
      (filterStatus === 'inactive' && !sekolah.status);
    
    const matchesSearch = 
      !searchTerm ||
      sekolah.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sekolah.npsn?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Sekolah</h1>
          <p className="text-lg text-gray-600">Kelola dan monitor semua sekolah di platform</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Sekolah
              </label>
              <input
                type="text"
                placeholder="Cari nama atau NPSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Sekolah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPSN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenjang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSekolahs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {loading ? 'Memuat...' : 'Tidak ada data sekolah'}
                    </td>
                  </tr>
                ) : (
                  filteredSekolahs.map((sekolah) => (
                    <tr key={sekolah.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sekolah.nama}</div>
                        {sekolah.alamat && (
                          <div className="text-sm text-gray-500">{sekolah.alamat}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sekolah.npsn || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sekolah.jenjang || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sekolah.status
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sekolah.status ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetail(sekolah.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleToggleStatus(sekolah.id, sekolah.status)}
                            className={`${
                              sekolah.status
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {sekolah.status ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetail && selectedSekolah && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Detail Sekolah</h3>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedSekolah(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSekolah.nama}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NPSN</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSekolah.npsn || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jenjang</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSekolah.jenjang || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tahun Berdiri</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSekolah.tahun_berdiri || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedSekolah.status
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedSekolah.status ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </p>
                  </div>
                  {selectedSekolah.alamat && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Alamat</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.alamat}</p>
                    </div>
                  )}
                  {selectedSekolah.provinsi && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provinsi</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.provinsi}</p>
                    </div>
                  )}
                  {selectedSekolah.kabupaten && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kabupaten</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.kabupaten}</p>
                    </div>
                  )}
                  {selectedSekolah.kecamatan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.kecamatan}</p>
                    </div>
                  )}
                  {selectedSekolah.kelurahan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kelurahan/Desa</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.kelurahan}</p>
                    </div>
                  )}
                  {selectedSekolah.telepon && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telepon</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.telepon}</p>
                    </div>
                  )}
                  {selectedSekolah.email_sekolah && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.email_sekolah}</p>
                    </div>
                  )}
                  {selectedSekolah.kepala_sekolah && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kepala Sekolah</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSekolah.kepala_sekolah}</p>
                    </div>
                  )}
                </div>

                {/* Statistik */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Statistik</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSekolah.users?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Pengguna</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSekolah.gurus?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Guru</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSekolah.siswas?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Siswa</div>
                    </div>
                    <div className="text-center col-span-3">
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedSekolah.kelas?.length || 0}
                      </div>
                      <div className="text-xs text-gray-500">Kelas</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetail(false);
                      setSelectedSekolah(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedSekolah.id, selectedSekolah.status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                      selectedSekolah.status
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {selectedSekolah.status ? 'Nonaktifkan Sekolah' : 'Aktifkan Sekolah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
