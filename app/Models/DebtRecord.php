<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DebtRecord extends Model
{
    protected $fillable = ['customer_id', 'sale_id', 'amount', 'type', 'notes'];

    public function customer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sale(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}
