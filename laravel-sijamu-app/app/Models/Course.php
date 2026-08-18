<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['code', 'name', 'credits', 'semester', 'study_program_id', 'user_id'];

    public function rpsDocuments()
    {
        return $this->hasMany(RpsDocument::class);
    }

    public function studyProgram()
    {
        return $this->belongsTo(StudyProgram::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
