<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterSekolahRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'npsn' => 'required|string|size:8|unique:sekolah,npsn',
            'jenjang' => 'required|in:SD/MI,SMP/MTs,SMA/MA,SMK/MAK',
            'status_sekolah' => 'required|in:Negeri,Swasta',
            'nama_sekolah' => 'required|string|max:255',
            'email_sekolah' => 'required|email|max:255|unique:users,email',
            'name' => 'required|string|max:255',
            'no_wa' => 'required|string|max:20|regex:/^[0-9+\-\s()]+$/',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->letters()      // Harus mengandung huruf
                    ->mixedCase()    // Harus mengandung huruf besar dan kecil
                    ->numbers()      // Harus mengandung angka
                    ->symbols(),     // Harus mengandung simbol
            ],
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
            'npsn.required' => 'NPSN wajib diisi',
            'npsn.size' => 'NPSN harus terdiri dari 8 karakter',
            'npsn.unique' => 'NPSN sudah terdaftar',
            'jenjang.required' => 'Jenjang pendidikan wajib dipilih',
            'jenjang.in' => 'Jenjang pendidikan tidak valid',
            'status_sekolah.required' => 'Status sekolah wajib dipilih',
            'status_sekolah.in' => 'Status sekolah tidak valid',
            'nama_sekolah.required' => 'Nama sekolah wajib diisi',
            'email_sekolah.required' => 'Email sekolah wajib diisi',
            'email_sekolah.email' => 'Format email tidak valid',
            'email_sekolah.unique' => 'Email sudah terdaftar',
            'name.required' => 'Nama admin wajib diisi',
            'no_wa.required' => 'Nomor WhatsApp wajib diisi',
            'no_wa.regex' => 'Format nomor WhatsApp tidak valid',
            'password.required' => 'Password wajib diisi',
            'password.confirmed' => 'Konfirmasi password tidak cocok',
            'password.min' => 'Password minimal 8 karakter',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'npsn' => 'NPSN',
            'jenjang' => 'jenjang pendidikan',
            'status_sekolah' => 'status sekolah',
            'nama_sekolah' => 'nama sekolah',
            'email_sekolah' => 'email sekolah',
            'name' => 'nama admin',
            'no_wa' => 'nomor WhatsApp',
            'password' => 'password',
        ];
    }
}
