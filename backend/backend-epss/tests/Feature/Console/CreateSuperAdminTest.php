<?php

namespace Tests\Feature\Console;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateSuperAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_first_super_admin_can_be_created(): void
    {
        $password = 'PasswordAdminTesting-2026!';

        $this->artisan('epss:create-super-admin')
            ->expectsQuestion('Nama administrator', 'Admin Pengujian')
            ->expectsQuestion('Username administrator', 'Admin.Latihan')
            ->expectsQuestion('Password administrator', $password)
            ->expectsQuestion('Ulangi password', $password)
            ->expectsOutput('Administrator berhasil dibuat.')
            ->expectsOutput('Username: admin.latihan')
            ->assertExitCode(0);
    
    $admin = User::where('username', 'admin.latihan')->firstOrFail();

    $this->assertDatabaseCount('users', 1);

    $this->assertSame(
        UserRole::SUPER_ADMIN_BIDANG,
        $admin->role
    );

    $this->assertTrue($admin->status_aktif);

    $this->assertNull($admin->email);

    $this->assertTrue(
        Hash::check($password, $admin->password)
    );

    }

    public function test_existing_inactive_admin_prevents_creation_of_another_admin(): void
    {
        $admin = User::factory()->create([
            'username' => 'admin.lama',
            'role' => UserRole::SUPER_ADMIN_BIDANG,
            'status_aktif' => false,
        ]);

        $this->artisan('epss:create-super-admin')
            ->expectsOutput(
                'Akun administrator sudah ada. Akun baru tidak dibuat.'
            )
            ->assertExitCode(1);

        $this->assertDatabaseCount('users', 1);

        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
            'username' => 'admin.lama',
            'role' => UserRole::SUPER_ADMIN_BIDANG->value,
            'status_aktif' => false,
        ]);
    }

}
