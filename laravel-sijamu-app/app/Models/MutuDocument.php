<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MutuDocument extends Model
{
    protected $fillable = [
        'study_program_id',
        'document_indicator_id',
        'user_id',
        'file_name',
        'file_path',
        'file_size',
        'file_type',
    ];

    public function studyProgram()
    {
        return $this->belongsTo(StudyProgram::class);
    }

    public function documentIndicator()
    {
        return $this->belongsTo(DocumentIndicator::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
