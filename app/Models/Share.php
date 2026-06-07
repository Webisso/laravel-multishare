<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Share extends Model
{
    public const TYPE_TEXT = 'text';

    public const TYPE_IMAGE = 'image';

    public const TYPE_VIDEO = 'video';

    public const TYPE_AUDIO = 'audio';

    public const TYPE_FILE = 'file';

    protected $fillable = [
        'public_id',
        'share_kind',
        'title',
        'text_content',
        'storage_disk',
        'storage_path',
        'storage_url',
        'original_name',
        'mime_type',
        'size',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'public_id';
    }

    public function isTextShare(): bool
    {
        return $this->share_kind === self::TYPE_TEXT;
    }

    public function isFileShare(): bool
    {
        return ! $this->isTextShare();
    }

    public function scopeExpired(Builder $query): Builder
    {
        return $query
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now());
    }
}
