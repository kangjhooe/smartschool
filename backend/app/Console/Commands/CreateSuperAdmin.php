<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create-super {--email=} {--password=} {--name=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Membuat user Super Admin';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Membuat Super Admin ===');

        // Cek apakah sudah ada super admin
        $existingSuperAdmin = User::where('role', 'super_admin')->first();
        if ($existingSuperAdmin) {
            $this->warn('Super Admin sudah ada:');
            $this->line('Email: ' . $existingSuperAdmin->email);
            $this->line('Name: ' . $existingSuperAdmin->name);
            
            if (!$this->confirm('Apakah Anda ingin membuat super admin baru?', false)) {
                $this->info('Dibatalkan.');
                return 0;
            }
        }

        // Ambil input
        $name = $this->option('name') ?: $this->ask('Nama Super Admin', 'Super Admin');
        $email = $this->option('email') ?: $this->ask('Email Super Admin');
        $password = $this->option('password') ?: $this->secret('Password (min 8 karakter)');

        // Validasi
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ], [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            $this->error('Validasi gagal:');
            foreach ($validator->errors()->all() as $error) {
                $this->error('  - ' . $error);
            }
            return 1;
        }

        // Buat super admin
        try {
            $superAdmin = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'instansi_id' => null,
            ]);

            $this->info('✓ Super Admin berhasil dibuat!');
            $this->line('');
            $this->line('Detail Super Admin:');
            $this->line('  ID: ' . $superAdmin->id);
            $this->line('  Name: ' . $superAdmin->name);
            $this->line('  Email: ' . $superAdmin->email);
            $this->line('  Role: ' . $superAdmin->role);
            $this->line('');
            $this->info('Anda dapat login menggunakan:');
            $this->line('  Email: ' . $email);
            $this->line('  Password: ' . ($this->option('password') ? '***' : 'password yang Anda masukkan'));

            return 0;
        } catch (\Exception $e) {
            $this->error('Gagal membuat Super Admin: ' . $e->getMessage());
            return 1;
        }
    }
}
