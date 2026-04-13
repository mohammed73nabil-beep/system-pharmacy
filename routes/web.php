<?php

use Illuminate\Support\Facades\Route;

// Catch-all route to serve the React application for any unspecified path.
// This allows React Router to handle the routing internally.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api).*$');
