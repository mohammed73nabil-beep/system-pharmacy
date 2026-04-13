<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DebtRecord;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebtController extends Controller
{
    /**
     * Get debt records for a specific customer.
     */
    public function index(Request $request)
    {
        $request->validate(['customer_id' => 'required|exists:customers,id']);
        
        return DebtRecord::with('sale')
            ->where('customer_id', $request->customer_id)
            ->latest()
            ->get();
    }

    /**
     * Store a new debt payment (repayment).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $customer = Customer::findOrFail($validated['customer_id']);
            
            // 1. Create the payment record
            $debtRecord = DebtRecord::create([
                'customer_id' => $validated['customer_id'],
                'amount' => $validated['amount'],
                'type' => 'payment',
                'notes' => $validated['notes'] ?? 'عملية تسديد دين',
            ]);

            // 2. Decrement the customer balance
            $customer->decrement('balance', $validated['amount']);

            return response()->json([
                'message' => 'تم تسجيل عملية التسديد بنجاح',
                'record' => $debtRecord,
                'new_balance' => $customer->balance
            ], 201);
        });
    }
}
