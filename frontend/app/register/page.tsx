'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    npsn: '',
    jenjang: '',
    status_sekolah: '',
    nama_sekolah: '',
    email_sekolah: '',
    name: '',
    no_wa: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerSekolah } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    setLoading(true);

    try {
      await registerSekolah(formData);
      router.push('/dashboard');
    } catch (err: any) {
      // Error logging sudah di-handle di api interceptor
      
      // Handle network errors
      if (!err.response) {
        if (err.message && err.message.includes('Network Error')) {
          setError('Tidak dapat terhubung ke server. Pastikan backend server berjalan di http://localhost:8000');
        } else {
          setError(err.message || 'Terjadi kesalahan saat mendaftar. Pastikan backend server berjalan.');
        }
        return;
      }
      
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat mendaftar';
      const errorDetails = err.response?.data?.error || err.response?.data?.errors;
      
      if (errorDetails) {
        if (typeof errorDetails === 'object') {
          // Jika errors adalah object (validation errors)
          const errorList = Object.values(errorDetails).flat().join(', ');
          setError(`${errorMessage}: ${errorList}`);
        } else {
          setError(`${errorMessage}: ${errorDetails}`);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Daftarkan Sekolah Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              masuk ke akun yang sudah ada
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Instansi</h3>
            </div>
            
            <div>
              <label htmlFor="npsn" className="block text-sm font-medium text-gray-700">
                NPSN *
              </label>
              <input
                id="npsn"
                name="npsn"
                type="text"
                required
                maxLength={8}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Contoh: 20212345"
                value={formData.npsn}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="jenjang" className="block text-sm font-medium text-gray-700">
                Jenjang *
              </label>
              <select
                id="jenjang"
                name="jenjang"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                value={formData.jenjang}
                onChange={handleChange}
              >
                <option value="">Pilih Jenjang</option>
                <option value="SD/MI">SD/MI</option>
                <option value="SMP/MTs">SMP/MTs</option>
                <option value="SMA/MA">SMA/MA</option>
                <option value="SMK/MAK">SMK/MAK</option>
              </select>
            </div>

            <div>
              <label htmlFor="status_sekolah" className="block text-sm font-medium text-gray-700">
                Status *
              </label>
              <select
                id="status_sekolah"
                name="status_sekolah"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                value={formData.status_sekolah}
                onChange={handleChange}
              >
                <option value="">Pilih Status</option>
                <option value="Negeri">Negeri</option>
                <option value="Swasta">Swasta</option>
              </select>
            </div>

            <div>
              <label htmlFor="nama_sekolah" className="block text-sm font-medium text-gray-700">
                Nama Instansi *
              </label>
              <input
                id="nama_sekolah"
                name="nama_sekolah"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.nama_sekolah}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email_sekolah" className="block text-sm font-medium text-gray-700">
                Email Instansi *
              </label>
              <input
                id="email_sekolah"
                name="email_sekolah"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.email_sekolah}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Data Admin</h3>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Lengkap *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="no_wa" className="block text-sm font-medium text-gray-700">
                Nomor WhatsApp *
              </label>
              <input
                id="no_wa"
                name="no_wa"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Contoh: 081234567890"
                value={formData.no_wa}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password *
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Daftar Sekolah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
