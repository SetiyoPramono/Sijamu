<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    protected $fillable = ['name', 'description'];

    public function documentIndicators()
    {
        return $this->hasMany(DocumentIndicator::class);
    }
}
