<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    protected $fillable = ['rps_document_id', 'auditor_id', 'audit_date', 'score', 'notes'];

    public function rpsDocument()
    {
        return $this->belongsTo(RpsDocument::class);
    }

    public function auditor()
    {
        return $this->belongsTo(User::class, 'auditor_id');
    }
}
