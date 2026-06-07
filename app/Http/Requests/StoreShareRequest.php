<?php

namespace App\Http\Requests;

use App\Models\Share;
use App\Support\ShareLimits;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreShareRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('text_content')) {
            return;
        }

        $this->merge([
            'text_content' => str_replace(["\r\n", "\r"], "\n", (string) $this->input('text_content')),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $shareKind = (string) $this->input('share_kind');
        $uploadMaxKilobytes = $shareKind && $shareKind !== Share::TYPE_TEXT
            ? ShareLimits::uploadKilobytes($shareKind)
            : ShareLimits::uploadKilobytes(Share::TYPE_FILE);

        return [
            'title' => ['nullable', 'string', 'max:120'],
            'share_kind' => ['required', 'string', 'in:'.implode(',', [
                Share::TYPE_TEXT,
                Share::TYPE_IMAGE,
                Share::TYPE_VIDEO,
                Share::TYPE_AUDIO,
                Share::TYPE_FILE,
            ])],
            'text_content' => ['nullable', 'required_if:share_kind,text', 'string', 'max:'.ShareLimits::textCharacters()],
            'upload' => ['nullable', 'required_unless:share_kind,text', 'file', 'max:'.$uploadMaxKilobytes],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $shareKind = (string) $this->input('share_kind');

            if ($shareKind === Share::TYPE_TEXT || ! $this->hasFile('upload')) {
                return;
            }

            $file = $this->file('upload');
            $mimeType = $file?->getMimeType() ?: $file?->getClientMimeType();

            if (! $file || ! $mimeType || ! $this->matchesExpectedFileType($shareKind, $mimeType)) {
                $validator->errors()->add('upload', 'The selected file does not match the chosen share type.');
            }
        });
    }

    public function attributes(): array
    {
        return [
            'share_kind' => 'share type',
            'text_content' => 'text content',
            'upload' => 'file',
        ];
    }

    protected function matchesExpectedFileType(string $shareKind, string $mimeType): bool
    {
        return match ($shareKind) {
            Share::TYPE_IMAGE => str_starts_with($mimeType, 'image/'),
            Share::TYPE_VIDEO => str_starts_with($mimeType, 'video/'),
            Share::TYPE_AUDIO => str_starts_with($mimeType, 'audio/'),
            Share::TYPE_FILE => true,
            default => false,
        };
    }
}
