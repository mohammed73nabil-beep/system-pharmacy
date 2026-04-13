<?php

use App\Http\Controllers\Api\MedicineController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\DebtController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// CORS headers for local dev
Route::options('{any}', function () {
    return response('', 200);
})->where('any', '.*');

// Public API Routes
Route::apiResource('medicines', MedicineController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('suppliers', SupplierController::class);
Route::apiResource('customers', CustomerController::class);
Route::apiResource('sales', SaleController::class);

Route::get('debts', [DebtController::class, 'index']);
Route::post('debts/payment', [DebtController::class, 'store']);

Route::get('settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);
Route::post('settings', [\App\Http\Controllers\Api\SettingController::class, 'store']);

Route::get('dashboard-stats', function () {
    $today = now()->toDateString();
    
    // Get last 7 days sales for chart
    // Ensure we have a point for today even if no sales exist
    $salesChart = \Illuminate\Support\Facades\DB::table('sales')
        ->selectRaw('DATE(created_at) as date, SUM(total) as revenue')
        ->where('created_at', '>=', now()->subDays(6)->startOfDay())
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get();

    return [
        'total_medicines'   => \App\Models\Medicine::count(),
        'low_stock'         => \App\Models\Medicine::whereColumn('quantity', '<=', 'min_quantity')->count(),
        'expired'           => \App\Models\Medicine::where('expiry_date', '<', now())->count(),
        'total_sales_today' => (float) \App\Models\Sale::whereDate('created_at', $today)->sum('total'),
        'total_orders_today'=> \App\Models\Sale::whereDate('created_at', $today)->count(),
        'total_customers'   => \App\Models\Customer::count(),
        'sales_chart'       => $salesChart
    ];
});
