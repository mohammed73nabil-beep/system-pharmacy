<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = ['name', 'phone', 'email', 'address', 'balance', 'notes', 'is_active'];

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function debtRecords(): HasMany
    {
        return $this->hasMany(DebtRecord::class);
    }
}
