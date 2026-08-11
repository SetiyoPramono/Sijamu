<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['code', 'name', 'credits', 'semester'];

    public function rpsDocuments()
    {
        return $this->hasMany(RpsDocument::class);
    }
}
