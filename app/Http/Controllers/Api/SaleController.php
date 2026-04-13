<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\Medicine;
use App\Models\Customer;
use App\Models\DebtRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function index()
    {
        return Sale::with(['customer', 'items'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.medicine_id' => 'required|exists:medicines,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,credit,card',
            'paid_amount' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $total = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $medicine = Medicine::findOrFail($item['medicine_id']);
                
                if ($medicine->quantity < $item['quantity']) {
                    return response()->json(['error' => "Insufficient stock for {$medicine->name}"], 422);
                }

                $itemTotal = $medicine->selling_price * $item['quantity'];
                $total += $itemTotal;

                $itemsData[] = [
                    'medicine_id' => $medicine->id,
                    'medicine_name' => $medicine->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $medicine->selling_price,
                    'total' => $itemTotal,
                ];

                $medicine->decrement('quantity', $item['quantity']);
            }

            $finalTotal = $total - ($validated['discount'] ?? 0);
            
            if ($validated['payment_method'] === 'credit') {
                if (empty($validated['customer_id'])) {
                    return response()->json(['error' => 'يجب اختيار عميل عند البيع بالآجل'], 422);
                }
                $debtAmount = max(0, $finalTotal - $validated['paid_amount']);
                if ($debtAmount > 0) {
                    $customer = Customer::findOrFail($validated['customer_id']);
                    $customer->increment('balance', $debtAmount);
                }
            }

            $sale = Sale::create([
                'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
                'customer_id' => $validated['customer_id'] ?? null,
                'user_id' => 1,
                'subtotal' => $total,
                'discount' => $validated['discount'] ?? 0,
                'total' => $finalTotal,
                'paid_amount' => $validated['paid_amount'],
                'change_amount' => max(0, $validated['paid_amount'] - $finalTotal),
                'payment_method' => $validated['payment_method'],
                'status' => 'completed',
            ]);

            $sale->items()->createMany($itemsData);

            // Record debt if it's a credit sale
            if ($validated['payment_method'] === 'credit' && isset($debtAmount) && $debtAmount > 0) {
                DebtRecord::create([
                    'customer_id' => $validated['customer_id'],
                    'sale_id' => $sale->id,
                    'amount' => $debtAmount,
                    'type' => 'debt',
                    'notes' => 'دين متبقي من فاتورة مبيع رقم: ' . $sale->invoice_number
                ]);
            }

            return response()->json($sale->load('items'), 201);
        });
    }

    public function show(Sale $sale)
    {
        return $sale->load(['customer', 'items']);
    }
}
