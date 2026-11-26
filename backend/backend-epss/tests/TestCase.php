<?php

namespace Tests;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Origin SPA yang terdaftar di SANCTUM_STATEFUL_DOMAINS (phpunit.xml)
    protected const ORIGIN_SPA = 'http://127.0.0.1:8000';

    // Masuk seperti SPA sungguhan: Sanctum hanya memulai session untuk Origin stateful,
    // dan EnforceSessionAge menolak session tanpa auth.login_at.
    // Tes yang butuh login_at lain cukup memanggil withSession() sesudahnya.
    public function actingAs(Authenticatable $user, $guard = null)
    {
        parent::actingAs($user, $guard);

        if (! array_key_exists('Origin', $this->defaultHeaders)) {
            $this->withHeader('Origin', static::ORIGIN_SPA);
        }

        return $this->withSession(['auth.login_at' => now()->timestamp]);
    }
}
