<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentIndicator extends Model
{
    protected $fillable = ['kode', 'nama', 'help', 'kriteria_lolos', 'kriteria_revisi', 'document_category_id'];

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'document_category_id');
    }

    public function criteria()
    {
        return $this->hasMany(DocumentIndicatorCriteria::class, 'document_indicator_id');
    }

    public function criterias()
    {
        return $this->criteria();
    }
}
