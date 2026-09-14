<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRpsDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled in the Service layer for finer control
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $maxSizeMb = \App\Models\SystemSetting::where('key', 'max_upload_size_mb')->value('value') ?? 20;
        $maxSizeKb = $maxSizeMb * 1024;

        return [
            'course_id' => 'required|exists:courses,id',
            'file' => 'required|file|mimes:pdf|max:' . $maxSizeKb,
        ];
    }
}
