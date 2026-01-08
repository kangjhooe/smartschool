'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { siswaService, Siswa } from '@/lib/services';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

type TabType = 'data-diri' | 'data-tambahan' | 'data-ayah' | 'data-ibu' | 'data-wali';

export default function SiswaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [siswas, setSiswas] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('data-diri');
  const [formData, setFormData] = useState({
    nik: '',
    nisn: '',
    nama_lengkap: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    telepon: '',
    tinggi_badan: '',
    berat_badan: '',
    data_disabilitas: '',
    hobi: '',
    cita_cita: '',
    jumlah_saudara_kandung: '',
    jumlah_saudara_tiri: '',
    nomor_kk: '',
    nama_ayah: '',
    status_ayah: '',
    tempat_lahir_ayah: '',
    tanggal_lahir_ayah: '',
    pendidikan_ayah: '',
    pekerjaan_ayah: '',
    alamat_ayah: '',
    nama_ibu: '',
    status_ibu: '',
    tempat_lahir_ibu: '',
    tanggal_lahir_ibu: '',
    pendidikan_ibu: '',
    pekerjaan_ibu: '',
    alamat_ibu: '',
    wali_sama_dengan: '',
    nama_wali: '',
    tempat_lahir_wali: '',
    tanggal_lahir_wali: '',
    pendidikan_wali: '',
    pekerjaan_wali: '',
    alamat_wali: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSiswas();
    }
  }, [user]);


  const loadSiswas = async () => {
    try {
      const data = await siswaService.getAll();
      setSiswas(data);
    } catch (error) {
      console.error('Error loading siswas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        nik: formData.nik,
        nisn: formData.nisn || undefined,
        nama_lengkap: formData.nama_lengkap,
        jenis_kelamin: formData.jenis_kelamin,
        tanggal_lahir: formData.tanggal_lahir,
        alamat: formData.alamat || undefined,
        telepon: formData.telepon || undefined,
        tinggi_badan: formData.tinggi_badan ? parseInt(formData.tinggi_badan) : undefined,
        berat_badan: formData.berat_badan ? parseInt(formData.berat_badan) : undefined,
        data_disabilitas: formData.data_disabilitas || undefined,
        hobi: formData.hobi || undefined,
        cita_cita: formData.cita_cita || undefined,
        jumlah_saudara_kandung: formData.jumlah_saudara_kandung ? parseInt(formData.jumlah_saudara_kandung) : undefined,
        jumlah_saudara_tiri: formData.jumlah_saudara_tiri ? parseInt(formData.jumlah_saudara_tiri) : undefined,
        nomor_kk: formData.nomor_kk || undefined,
        nama_ayah: formData.nama_ayah || undefined,
        status_ayah: formData.status_ayah || undefined,
        tempat_lahir_ayah: formData.tempat_lahir_ayah || undefined,
        tanggal_lahir_ayah: formData.tanggal_lahir_ayah || undefined,
        pendidikan_ayah: formData.pendidikan_ayah || undefined,
        pekerjaan_ayah: formData.pekerjaan_ayah || undefined,
        alamat_ayah: formData.alamat_ayah || undefined,
        nama_ibu: formData.nama_ibu || undefined,
        status_ibu: formData.status_ibu || undefined,
        tempat_lahir_ibu: formData.tempat_lahir_ibu || undefined,
        tanggal_lahir_ibu: formData.tanggal_lahir_ibu || undefined,
        pendidikan_ibu: formData.pendidikan_ibu || undefined,
        pekerjaan_ibu: formData.pekerjaan_ibu || undefined,
        alamat_ibu: formData.alamat_ibu || undefined,
        wali_sama_dengan: formData.wali_sama_dengan || undefined,
        nama_wali: formData.nama_wali || undefined,
        tempat_lahir_wali: formData.tempat_lahir_wali || undefined,
        tanggal_lahir_wali: formData.tanggal_lahir_wali || undefined,
        pendidikan_wali: formData.pendidikan_wali || undefined,
        pekerjaan_wali: formData.pekerjaan_wali || undefined,
        alamat_wali: formData.alamat_wali || undefined,
      };

      if (editingSiswa) {
        await siswaService.update(editingSiswa.id, submitData);
      } else {
        await siswaService.create(submitData);
      }
      setShowModal(false);
      setEditingSiswa(null);
      resetForm();
      loadSiswas();
    } catch (error: any) {
      console.error('Error saving siswa:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat menyimpan data';
      alert(errorMessage);
    }
  };

  const handleEdit = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setFormData({
      nik: siswa.nik || '',
      nisn: siswa.nisn || '',
      nama_lengkap: siswa.nama_lengkap,
      jenis_kelamin: siswa.jenis_kelamin || '',
      tanggal_lahir: siswa.tanggal_lahir ? siswa.tanggal_lahir.split('T')[0] : '',
      alamat: siswa.alamat || '',
      telepon: siswa.telepon || '',
      tinggi_badan: siswa.tinggi_badan?.toString() || '',
      berat_badan: siswa.berat_badan?.toString() || '',
      data_disabilitas: siswa.data_disabilitas || '',
      hobi: siswa.hobi || '',
      cita_cita: siswa.cita_cita || '',
      jumlah_saudara_kandung: siswa.jumlah_saudara_kandung?.toString() || '',
      jumlah_saudara_tiri: siswa.jumlah_saudara_tiri?.toString() || '',
      nomor_kk: siswa.nomor_kk || '',
      nama_ayah: siswa.nama_ayah || '',
      status_ayah: siswa.status_ayah || '',
      tempat_lahir_ayah: siswa.tempat_lahir_ayah || '',
      tanggal_lahir_ayah: siswa.tanggal_lahir_ayah ? siswa.tanggal_lahir_ayah.split('T')[0] : '',
      pendidikan_ayah: siswa.pendidikan_ayah || '',
      pekerjaan_ayah: siswa.pekerjaan_ayah || '',
      alamat_ayah: siswa.alamat_ayah || '',
      nama_ibu: siswa.nama_ibu || '',
      status_ibu: siswa.status_ibu || '',
      tempat_lahir_ibu: siswa.tempat_lahir_ibu || '',
      tanggal_lahir_ibu: siswa.tanggal_lahir_ibu ? siswa.tanggal_lahir_ibu.split('T')[0] : '',
      pendidikan_ibu: siswa.pendidikan_ibu || '',
      pekerjaan_ibu: siswa.pekerjaan_ibu || '',
      alamat_ibu: siswa.alamat_ibu || '',
      wali_sama_dengan: siswa.wali_sama_dengan || '',
      nama_wali: siswa.nama_wali || '',
      tempat_lahir_wali: siswa.tempat_lahir_wali || '',
      tanggal_lahir_wali: siswa.tanggal_lahir_wali ? siswa.tanggal_lahir_wali.split('T')[0] : '',
      pendidikan_wali: siswa.pendidikan_wali || '',
      pekerjaan_wali: siswa.pekerjaan_wali || '',
      alamat_wali: siswa.alamat_wali || '',
    });
    setActiveTab('data-diri');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await siswaService.delete(id);
      loadSiswas();
    } catch (error: any) {
      console.error('Error deleting siswa:', error);
      const errorMessage = error?.message || 'Terjadi kesalahan saat menghapus data';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      nik: '',
      nisn: '',
      nama_lengkap: '',
      jenis_kelamin: '',
      tanggal_lahir: '',
      alamat: '',
      telepon: '',
      tinggi_badan: '',
      berat_badan: '',
      data_disabilitas: '',
      hobi: '',
      cita_cita: '',
      jumlah_saudara_kandung: '',
      jumlah_saudara_tiri: '',
      nomor_kk: '',
      nama_ayah: '',
      status_ayah: '',
      tempat_lahir_ayah: '',
      tanggal_lahir_ayah: '',
      pendidikan_ayah: '',
      pekerjaan_ayah: '',
      alamat_ayah: '',
      nama_ibu: '',
      status_ibu: '',
      tempat_lahir_ibu: '',
      tanggal_lahir_ibu: '',
      pendidikan_ibu: '',
      pekerjaan_ibu: '',
      alamat_ibu: '',
      wali_sama_dengan: '',
      nama_wali: '',
      tempat_lahir_wali: '',
      tanggal_lahir_wali: '',
      pendidikan_wali: '',
      pekerjaan_wali: '',
      alamat_wali: '',
    });
    setActiveTab('data-diri');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'data-diri', label: 'Data Diri' },
    { id: 'data-tambahan', label: 'Data Tambahan' },
    { id: 'data-ayah', label: 'Data Ayah' },
    { id: 'data-ibu', label: 'Data Ibu' },
    { id: 'data-wali', label: 'Data Wali' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data-diri':
        return (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                placeholder="Nomor Induk Kependudukan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NISN
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                placeholder="Nomor Induk Siswa Nasional"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                placeholder="Nama lengkap siswa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
              >
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Siswa
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Alamat lengkap siswa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telepon
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                placeholder="Nomor telepon"
              />
            </div>
          </div>
        );

      case 'data-tambahan':
        return (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tinggi_badan}
                onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })}
                placeholder="Tinggi badan dalam cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.berat_badan}
                onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })}
                placeholder="Berat badan dalam kg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Disabilitas
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={formData.data_disabilitas}
                onChange={(e) => setFormData({ ...formData, data_disabilitas: e.target.value })}
                placeholder="Jelaskan kondisi disabilitas jika ada"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hobi
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.hobi}
                onChange={(e) => setFormData({ ...formData, hobi: e.target.value })}
                placeholder="Hobi siswa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cita-cita
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.cita_cita}
                onChange={(e) => setFormData({ ...formData, cita_cita: e.target.value })}
                placeholder="Cita-cita siswa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Saudara Kandung
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.jumlah_saudara_kandung}
                onChange={(e) => setFormData({ ...formData, jumlah_saudara_kandung: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Saudara Tiri
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.jumlah_saudara_tiri}
                onChange={(e) => setFormData({ ...formData, jumlah_saudara_tiri: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor KK
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nomor_kk}
                onChange={(e) => setFormData({ ...formData, nomor_kk: e.target.value })}
                placeholder="Nomor Kartu Keluarga"
              />
            </div>
          </div>
        );

      case 'data-ayah':
        return (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Ayah Kandung
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nama_ayah}
                onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
                placeholder="Nama lengkap ayah kandung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.status_ayah}
                onChange={(e) => setFormData({ ...formData, status_ayah: e.target.value })}
              >
                <option value="">Pilih</option>
                <option value="Masih Hidup">Masih Hidup</option>
                <option value="Meninggal Dunia">Meninggal Dunia</option>
                <option value="Tidak Diketahui">Tidak Diketahui</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tempat_lahir_ayah}
                onChange={(e) => setFormData({ ...formData, tempat_lahir_ayah: e.target.value })}
                placeholder="Tempat lahir ayah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tanggal_lahir_ayah}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir_ayah: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pendidikan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pendidikan_ayah}
                onChange={(e) => setFormData({ ...formData, pendidikan_ayah: e.target.value })}
                placeholder="Tingkat pendidikan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pekerjaan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pekerjaan_ayah}
                onChange={(e) => setFormData({ ...formData, pekerjaan_ayah: e.target.value })}
                placeholder="Pekerjaan ayah"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Ayah
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={formData.alamat_ayah}
                onChange={(e) => setFormData({ ...formData, alamat_ayah: e.target.value })}
                placeholder="Alamat lengkap ayah"
              />
            </div>
          </div>
        );

      case 'data-ibu':
        return (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Ibu Kandung
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nama_ibu}
                onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                placeholder="Nama lengkap ibu kandung"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.status_ibu}
                onChange={(e) => setFormData({ ...formData, status_ibu: e.target.value })}
              >
                <option value="">Pilih</option>
                <option value="Masih Hidup">Masih Hidup</option>
                <option value="Meninggal Dunia">Meninggal Dunia</option>
                <option value="Tidak Diketahui">Tidak Diketahui</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tempat_lahir_ibu}
                onChange={(e) => setFormData({ ...formData, tempat_lahir_ibu: e.target.value })}
                placeholder="Tempat lahir ibu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tanggal_lahir_ibu}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir_ibu: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pendidikan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pendidikan_ibu}
                onChange={(e) => setFormData({ ...formData, pendidikan_ibu: e.target.value })}
                placeholder="Tingkat pendidikan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pekerjaan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pekerjaan_ibu}
                onChange={(e) => setFormData({ ...formData, pekerjaan_ibu: e.target.value })}
                placeholder="Pekerjaan ibu"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Ibu
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={formData.alamat_ibu}
                onChange={(e) => setFormData({ ...formData, alamat_ibu: e.target.value })}
                placeholder="Alamat lengkap ibu"
              />
            </div>
          </div>
        );

      case 'data-wali':
        return (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wali Sama Dengan
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={formData.wali_sama_dengan}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Ayah Kandung') {
                    setFormData(prev => ({
                      ...prev,
                      wali_sama_dengan: value,
                      nama_wali: prev.nama_ayah || '',
                      tempat_lahir_wali: prev.tempat_lahir_ayah || '',
                      tanggal_lahir_wali: prev.tanggal_lahir_ayah || '',
                      pendidikan_wali: prev.pendidikan_ayah || '',
                      pekerjaan_wali: prev.pekerjaan_ayah || '',
                      alamat_wali: prev.alamat_ayah || '',
                    }));
                  } else if (value === 'Ibu Kandung') {
                    setFormData(prev => ({
                      ...prev,
                      wali_sama_dengan: value,
                      nama_wali: prev.nama_ibu || '',
                      tempat_lahir_wali: prev.tempat_lahir_ibu || '',
                      tanggal_lahir_wali: prev.tanggal_lahir_ibu || '',
                      pendidikan_wali: prev.pendidikan_ibu || '',
                      pekerjaan_wali: prev.pekerjaan_ibu || '',
                      alamat_wali: prev.alamat_ibu || '',
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      wali_sama_dengan: value,
                      nama_wali: '',
                      tempat_lahir_wali: '',
                      tanggal_lahir_wali: '',
                      pendidikan_wali: '',
                      pekerjaan_wali: '',
                      alamat_wali: '',
                    }));
                  }
                }}
              >
                <option value="">Pilih</option>
                <option value="Ayah Kandung">Ayah Kandung</option>
                <option value="Ibu Kandung">Ibu Kandung</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Wali
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.nama_wali}
                onChange={(e) => setFormData({ ...formData, nama_wali: e.target.value })}
                placeholder="Nama lengkap wali"
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempat Lahir
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tempat_lahir_wali}
                onChange={(e) => setFormData({ ...formData, tempat_lahir_wali: e.target.value })}
                placeholder="Tempat lahir wali"
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.tanggal_lahir_wali}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir_wali: e.target.value })}
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pendidikan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pendidikan_wali}
                onChange={(e) => setFormData({ ...formData, pendidikan_wali: e.target.value })}
                placeholder="Tingkat pendidikan"
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pekerjaan
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={formData.pekerjaan_wali}
                onChange={(e) => setFormData({ ...formData, pekerjaan_wali: e.target.value })}
                placeholder="Pekerjaan wali"
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Wali
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                value={formData.alamat_wali}
                onChange={(e) => setFormData({ ...formData, alamat_wali: e.target.value })}
                placeholder="Alamat lengkap wali"
                disabled={formData.wali_sama_dengan === 'Ayah Kandung' || formData.wali_sama_dengan === 'Ibu Kandung'}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

  if (!user) return null;

  return (
    <Layout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Siswa</h1>
            <p className="text-gray-600 mt-1">Kelola data siswa di sekolah Anda</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingSiswa(null);
              setShowModal(true);
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Siswa
          </Button>
        </div>

        <Card>
          {siswas.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data siswa</h3>
              <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan siswa baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NISN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {siswas.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{siswa.nik}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{siswa.nama_lengkap}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{siswa.nisn || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{siswa.jenis_kelamin || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(siswa)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDelete(siswa.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingSiswa(null);
            resetForm();
          }}
          title={editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
              {renderTabContent()}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-5 border-t border-gray-200">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}. {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSiswa(null);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {editingSiswa ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
