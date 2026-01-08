import api from './api';

export interface User {
  id: number;
  name: string;
  email: string | null;
  no_wa?: string | null;
  role: 'super_admin' | 'admin_sekolah' | 'guru';
  instansi_id: number | null;
  instansi?: {
    id: number;
    npsn?: string;
    jenjang?: 'SD/MI' | 'SMP/MTs' | 'SMA/MA' | 'SMK/MAK';
    status_sekolah?: 'Negeri' | 'Swasta';
    nama: string;
    alamat?: string;
    telepon?: string;
  };
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterSekolahData {
  npsn: string;
  jenjang: 'SD/MI' | 'SMP/MTs' | 'SMA/MA' | 'SMK/MAK';
  status_sekolah: 'Negeri' | 'Swasta';
  nama_sekolah: string;
  email_sekolah: string;
  name: string;
  no_wa: string;
  password: string;
  password_confirmation: string;
}

export const authService = {
  async registerSekolah(data: RegisterSekolahData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/register-sekolah', data);
    return response.data;
  },

  async login(emailOrNpsn: string, password: string): Promise<LoginResponse> {
    // Biarkan axios interceptor menangani error
    // Error akan di-format oleh interceptor sebelum di-throw
    const response = await api.post<LoginResponse>('/login', { email: emailOrNpsn, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/logout');
  },

  async me(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/me');
    return response.data;
  },
};
