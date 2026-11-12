<?php

namespace App\Http\Controllers;

use App\Http\Resources\IndikatorEPSSResource;
use App\Models\IndikatorEPSS;
use App\Models\PeriodeEvaluasi;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class PeriodeIndikatorController extends Controller
{
    public function __invoke(
        PeriodeEvaluasi $periode
    ): AnonymousResourceCollection {
        Gate::authorize('view', $periode);

        $indikator = IndikatorEPSS::query()
            ->whereHas('aspek.domain', function ($query) use ($periode) {
                $query->where(
                    'versi_instrumen_id',
                    $periode->versi_instrumen_id
                );
            })
            ->with([
                'aspek:id,domain_id,kode,nama',
                'aspek.domain:id,kode,nama',
                'kriteriaLevels' => fn ($query) => $query
                    ->orderBy('level')
                    ->with([
                        'persyaratanBukti' => fn ($requirements) => $requirements->orderBy('urutan'),
                        'kriteriaPemenuhan' => fn ($items) => $items->orderBy('urutan'),
                    ]),
            ])
            ->orderBy('kode')
            ->orderBy('id')
            ->get();

        return IndikatorEPSSResource::collection($indikator);
    }
}
