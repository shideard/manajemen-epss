<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaptchaController
{
    public function show(Request $request): JsonResponse
    {
        $a = random_int(1, 9);
        $b = random_int(1, 9);

        $request->session()->put('captcha_answer', $a + $b);

        return response()->json([
            'question' => "{$a} + {$b} = ?",
        ]);
    }
}