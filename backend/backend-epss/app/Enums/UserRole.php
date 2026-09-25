<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN_BIDANG = 'SUPER_ADMIN_BIDANG';
    case OPERATOR = 'OPERATOR';
    case VERIFIKATOR = 'VERIFIKATOR';
}