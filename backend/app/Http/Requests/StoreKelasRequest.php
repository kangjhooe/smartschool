<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKelasRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization sudah di-handle oleh middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'tingkat' => 'nullable|string|max:255',
            'jurusan' => 'nullable|string|max:255',
            'wali_kelas_id' => 'nullable|exists:guru,id',
            'keterangan' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama kelas wajib diisi',
            'nama.string' => 'Nama kelas harus berupa teks',
            'nama.max' => 'Nama kelas maksimal 255 karakter',
            'wali_kelas_id.exists' => 'Guru yang dipilih tidak ditemukan',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validasi wali_kelas_id harus dari instansi yang sama
            if ($this->wali_kelas_id) {
                $user = $this->user();
                $instansiId = $user->instansi_id;
                
                $guru = \App\Models\Guru::where('id', $this->wali_kelas_id)
                    ->where('instansi_id', $instansiId)
                    ->first();
                
                if (!$guru) {
                    $validator->errors()->add('wali_kelas_id', 'Guru yang dipilih tidak ditemukan atau tidak terikat ke sekolah ini');
                }
            }
        });
    }
}
