import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to false to avoid CORS issues
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request untuk debugging
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error Details:', {
        message: error.message,
        code: error.code,
        request: error.config,
        apiUrl: API_URL,
        fullError: error
      });
      
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || error.message?.includes('Network Error')) {
        error.message = 'Tidak dapat terhubung ke server. Pastikan backend server berjalan di http://localhost:8000';
      }
    }

    // Handle 401 (Unauthorized) - hanya redirect jika tidak di halaman login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Jangan redirect jika sudah di halaman login (biarkan error ditampilkan)
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    
    // Format error message yang lebih baik
    // Prioritas: gunakan message dari backend response jika ada
    if (error.response?.data?.message) {
      // Selalu gunakan message dari backend untuk error dengan response
      error.message = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Jika tidak ada message, gunakan errors
      const errors = error.response.data.errors;
      const firstError = Object.values(errors)[0];
      error.message = Array.isArray(firstError) ? firstError[0] : firstError;
    } else if (!error.response) {
      // Untuk network errors, pastikan message sudah di-set
      if (!error.message || error.message === 'Network Error' || error.message?.includes('Network Error')) {
        error.message = 'Tidak dapat terhubung ke server. Pastikan backend server berjalan di http://localhost:8000';
      }
    } else if (error.message?.startsWith('Request failed with status code')) {
      // Jika masih menggunakan default axios message, ganti dengan yang lebih user-friendly
      const status = error.response?.status;
      if (status === 401) {
        error.message = 'Email/NPSN atau password salah';
      } else if (status === 403) {
        error.message = 'Akses ditolak';
      } else if (status === 404) {
        error.message = 'Endpoint tidak ditemukan';
      } else if (status === 422) {
        error.message = 'Validasi gagal';
      } else if (status === 500) {
        error.message = 'Terjadi kesalahan di server';
      } else {
        error.message = `Terjadi kesalahan (${status})`;
      }
    }
    
    // Simpan original message untuk debugging
    if (error.response && !error.originalMessage) {
      error.originalMessage = error.message;
      if (error.response.data?.message) {
        error.originalMessage = error.response.data.message;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
