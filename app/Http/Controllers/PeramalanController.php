<?php

namespace App\Http\Controllers;

use App\Models\DataPeramalan;

class PeramalanController extends Controller
{
    public static function total(): int
    {
        return DataPeramalan::count();
    }
}
