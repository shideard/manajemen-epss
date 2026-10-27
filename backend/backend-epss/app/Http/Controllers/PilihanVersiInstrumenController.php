<?php

namespace App\Http\Controllers;

use App\Http\Resources\VersiInstrumenResource;
use App\Models\PeriodeEvaluasi;
use App\Models\VersiInstrumenEPSS;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PilihanVersiInstrumenController extends Controller
{
    public function __invoke(): AnonymousResourceCollection
    {
        Gate::authorize('create', PeriodeEvaluasi::class);

        $versi = VersiInstrumenEPSS::query()
            ->orderByDesc('berlaku_mulai')
            ->orderBy('id')
            ->paginate(20);

        return VersiInstrumenResource::collection($versi);
    }
}