<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Hapus data yang sudah lewat masa simpannya (mis. audit log > 24 bulan, lihat AuditLog::prunable).
// Butuh cron `* * * * * cd <app> && php artisan schedule:run` di server.
Schedule::command('model:prune')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
