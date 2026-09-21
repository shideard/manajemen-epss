<?php

namespace App\Enums;

enum UserRole: string
{
    case OPERATOR = 'OPERATOR';
    case VERIFIKATOR = 'VERIFIKATOR';
}