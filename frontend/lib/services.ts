import api from './api';

export interface Guru {
  id: number;
  user_id?: number;
  instansi_id: number;
  nip?: string;
  nama_lengkap: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  telepon?: string;
}

export interface Siswa {
  id: number;
  user_id?: number;
  instansi_id: number;
  nik: string;
  nisn?: string;
  nama_lengkap: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat?: string;
  telepon?: string;
  tinggi_badan?: number;
  berat_badan?: number;
  data_disabilitas?: string;
  hobi?: string;
  cita_cita?: string;
  jumlah_saudara_kandung?: number;
  jumlah_saudara_tiri?: number;
  nomor_kk?: string;
  nama_ayah?: string;
  status_ayah?: 'Masih Hidup' | 'Meninggal Dunia' | 'Tidak Diketahui';
  tempat_lahir_ayah?: string;
  tanggal_lahir_ayah?: string;
  pendidikan_ayah?: string;
  pekerjaan_ayah?: string;
  alamat_ayah?: string;
  nama_ibu?: string;
  status_ibu?: 'Masih Hidup' | 'Meninggal Dunia' | 'Tidak Diketahui';
  tempat_lahir_ibu?: string;
  tanggal_lahir_ibu?: string;
  pendidikan_ibu?: string;
  pekerjaan_ibu?: string;
  alamat_ibu?: string;
  wali_sama_dengan?: 'Ayah Kandung' | 'Ibu Kandung' | 'Lainnya';
  nama_wali?: string;
  tempat_lahir_wali?: string;
  tanggal_lahir_wali?: string;
  pendidikan_wali?: string;
  pekerjaan_wali?: string;
  alamat_wali?: string;
}

export interface Kelas {
  id: number;
  instansi_id: number;
  nama: string;
  tingkat?: string;
  jurusan?: string;
  wali_kelas_id?: number;
  keterangan?: string;
}

export interface Sekolah {
  id: number;
  npsn?: string;
  nama: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  email_sekolah?: string;
  kepala_sekolah?: string;
  jenjang?: string;
  status_sekolah?: string;
  status: boolean;
  tahun_berdiri?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  kelurahan?: string;
  created_at?: string;
  updated_at?: string;
  users?: any[];
  gurus?: any[];
  siswas?: any[];
  kelas?: any[];
}

export const guruService = {
  async getAll(): Promise<Guru[]> {
    const response = await api.get<Guru[]>('/guru');
    return response.data;
  },

  async getById(id: number): Promise<Guru> {
    const response = await api.get<Guru>(`/guru/${id}`);
    return response.data;
  },

  async create(data: Partial<Guru>): Promise<{ message: string; guru: Guru }> {
    const response = await api.post<{ message: string; guru: Guru }>('/guru', data);
    return response.data;
  },

  async update(id: number, data: Partial<Guru>): Promise<{ message: string; guru: Guru }> {
    const response = await api.put<{ message: string; guru: Guru }>(`/guru/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/guru/${id}`);
    return response.data;
  },
};

export const siswaService = {
  async getAll(): Promise<Siswa[]> {
    const response = await api.get<Siswa[]>('/siswa');
    return response.data;
  },

  async getById(id: number): Promise<Siswa> {
    const response = await api.get<Siswa>(`/siswa/${id}`);
    return response.data;
  },

  async create(data: Partial<Siswa>): Promise<{ message: string; siswa: Siswa }> {
    const response = await api.post<{ message: string; siswa: Siswa }>('/siswa', data);
    return response.data;
  },

  async update(id: number, data: Partial<Siswa>): Promise<{ message: string; siswa: Siswa }> {
    const response = await api.put<{ message: string; siswa: Siswa }>(`/siswa/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/siswa/${id}`);
    return response.data;
  },
};

export const kelasService = {
  async getAll(): Promise<Kelas[]> {
    const response = await api.get<Kelas[]>('/kelas');
    return response.data;
  },

  async getById(id: number): Promise<Kelas> {
    const response = await api.get<Kelas>(`/kelas/${id}`);
    return response.data;
  },

  async create(data: Partial<Kelas>): Promise<{ message: string; kelas: Kelas }> {
    const response = await api.post<{ message: string; kelas: Kelas }>('/kelas', data);
    return response.data;
  },

  async update(id: number, data: Partial<Kelas>): Promise<{ message: string; kelas: Kelas }> {
    const response = await api.put<{ message: string; kelas: Kelas }>(`/kelas/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/kelas/${id}`);
    return response.data;
  },

  async attachSiswa(kelasId: number, siswaId: number, tahunAjaran?: string, semester?: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(`/kelas/${kelasId}/siswa`, {
      siswa_id: siswaId,
      tahun_ajaran: tahunAjaran,
      semester: semester,
    });
    return response.data;
  },

  async detachSiswa(kelasId: number, siswaId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/kelas/${kelasId}/siswa/${siswaId}`);
    return response.data;
  },
};

export interface SekolahUpdateRequest {
  id: number;
  sekolah_id: number;
  requested_npsn: string;
  requested_nama: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  approved_by?: number;
  created_at: string;
  updated_at: string;
}

export const sekolahService = {
  async getSekolah(): Promise<Sekolah> {
    const response = await api.get<Sekolah>('/sekolah');
    return response.data;
  },

  async updateSekolah(data: {
    tahun_berdiri?: string;
    alamat?: string;
    telepon?: string;
    email?: string;
    kepala_sekolah?: string;
    jenjang?: string;
    status_sekolah?: string;
    provinsi?: string;
    kabupaten?: string;
    kecamatan?: string;
    kelurahan?: string;
  }): Promise<{ message: string; sekolah: Sekolah }> {
    const response = await api.put<{ message: string; sekolah: Sekolah }>('/sekolah', data);
    return response.data;
  },

  async requestUpdate(data: { 
    npsn: string; 
    nama: string;
  }): Promise<{ message: string; request: SekolahUpdateRequest }> {
    const response = await api.post<{ message: string; request: SekolahUpdateRequest }>('/sekolah/update-request', data);
    return response.data;
  },

  async getPendingRequest(): Promise<SekolahUpdateRequest> {
    const response = await api.get<SekolahUpdateRequest>('/sekolah/update-request');
    return response.data;
  },
};

export const superAdminService = {
  async getAllSekolah(): Promise<Sekolah[]> {
    const response = await api.get<Sekolah[]>('/admin/sekolah');
    return response.data;
  },

  async getSekolahById(id: number): Promise<Sekolah> {
    const response = await api.get<Sekolah>(`/admin/sekolah/${id}`);
    return response.data;
  },

  async updateSekolahStatus(id: number, status: boolean): Promise<{ message: string; sekolah: Sekolah }> {
    const response = await api.put<{ message: string; sekolah: Sekolah }>(`/admin/sekolah/${id}/status`, { status });
    return response.data;
  },

  async getUpdateRequests(): Promise<SekolahUpdateRequest[]> {
    const response = await api.get<SekolahUpdateRequest[]>('/admin/sekolah/update-requests');
    return response.data;
  },

  async approveUpdateRequest(requestId: number): Promise<{ message: string; request: SekolahUpdateRequest }> {
    const response = await api.put<{ message: string; request: SekolahUpdateRequest }>(`/admin/sekolah/update-requests/${requestId}/approve`);
    return response.data;
  },

  async rejectUpdateRequest(requestId: number, reason: string): Promise<{ message: string; request: SekolahUpdateRequest }> {
    const response = await api.put<{ message: string; request: SekolahUpdateRequest }>(`/admin/sekolah/update-requests/${requestId}/reject`, { reason });
    return response.data;
  },
};
