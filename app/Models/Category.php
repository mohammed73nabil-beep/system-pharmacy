<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'name_ar', 'description', 'is_active'];

    public function medicines(): HasMany
    {
        return $this->hasMany(Medicine::class);
    }
}
