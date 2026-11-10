<?php

namespace App\Enums;

enum StatusAjuanBukti: string
{
    case DRAFT = 'DRAFT';
    case MENUNGGU = 'MENUNGGU';
    case PERBAIKAN = 'PERBAIKAN';
    case TERVERIFIKASI = 'TERVERIFIKASI';
}
