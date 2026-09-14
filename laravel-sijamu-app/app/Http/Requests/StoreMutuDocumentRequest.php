<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMutuDocumentRequest extends FormRequest
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
        $maxSizeMb = \App\Models\SystemSetting::where('key', 'max_upload_size_mb')->value('value') ?? 10;
        $maxSizeKb = $maxSizeMb * 1024;

        return [
            'study_program_id' => 'required|exists:study_programs,id',
            'document_indicator_id' => 'required|exists:document_indicators,id',
            'file' => 'required|file|mimes:pdf|max:' . $maxSizeKb,
        ];
    }
}
