<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RpsDocument extends Model
{
    protected $fillable = ['course_id', 'user_id', 'file_name', 'file_size', 'file_path', 'status', 'upload_date'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function audits()
    {
        return $this->hasMany(Audit::class);
    }
}
