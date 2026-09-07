<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'semester',
        'is_current',
        'upload_deadline',
    ];

    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'upload_deadline' => 'datetime',
        ];
    }
}
