<?php

namespace App\Http\Controllers;

use App\Http\Resources\OpdResource;
use App\Models\Opd;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PilihanOpdController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        Gate::authorize('viewOptions', Opd::class);

        $opds = Opd::query()
            ->where('status_aktif', true)
            ->orderBy('nama')
            ->orderBy('id')
            ->paginate(20);

        return OpdResource::collection($opds);
    }
}