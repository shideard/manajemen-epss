<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $modulePath = app_path('Modules');

        if (File::exists($modulePath)) {
            $modules = array_map('basename', File::directories($modulePath));

            foreach ($modules as $module) {
                // Load API Modules
                $routePath = app_path("Modules/{$module}/Routes/api.php");
                if (File::exists($routePath)) {
                    Route::prefix('api')
                        ->middleware('api')
                        ->group($routePath);
                }

                //Load Migrations
                $migrationPath = app_path("Modules/{$module}/Database/Migrations");
                if (File::exists($migrationPath)) {
                    $this->loadMigrationsFrom($migrationPath);
                }
            }
        }
    }
}
