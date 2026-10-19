<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class PasswordLifecycleTest extends TestCase
{
    public function test_password_change_requirement_matches_account_condition(): void
    {
        $this->travelTo(
            CarbonImmutable::parse('2026-10-19 10:00:00', 'UTC')
        );

        try {
            $cases = [
                'flag_requires_change' => [
                    'must_change_password' => true,
                    'password_changed_at' => '2026-10-18 10:00:00',
                    'expected' => true,
                ],
                'missing_change_date' => [
                    'must_change_password' => false,
                    'password_changed_at' => null,
                    'expected' => true,
                ],
                'one_second_before_expiration' => [
                    'must_change_password' => false,
                    'password_changed_at' => '2025-10-19 10:00:01',
                    'expected' => false,
                ],
                'exactly_at_expiration' => [
                    'must_change_password' => false,
                    'password_changed_at' => '2025-10-19 10:00:00',
                    'expected' => true,
                ],
                'after_expiration' => [
                    'must_change_password' => false,
                    'password_changed_at' => '2025-10-19 09:59:59',
                    'expected' => true,
                ],
            ];

            foreach ($cases as $name => $case) {
                $user = new User();

                $user->must_change_password =
                    $case['must_change_password'];

                $user->password_changed_at =
                    $case['password_changed_at'];

                $this->assertSame(
                    $case['expected'],
                    $user->requiresPasswordChange(),
                    $name
                );
            }
        } finally {
            $this->travelBack();
        }
    }

    public function test_leap_day_password_expires_on_february_28_next_year(): void
    {
        $this->travelTo(
            CarbonImmutable::parse('2025-02-28 10:00:00', 'UTC')
        );

        try {
            $user = new User();
            $user->must_change_password = false;
            $user->password_changed_at = '2024-02-29 10:00:00';

            $this->assertTrue($user->requiresPasswordChange());

            $this->assertSame(
                '2024-02-29 10:00:00',
                $user->password_changed_at->format('Y-m-d H:i:s')
            );
        } finally {
            $this->travelBack();
        }
    }
}
