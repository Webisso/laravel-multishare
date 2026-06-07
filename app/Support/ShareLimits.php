<?php

namespace App\Support;

use App\Models\Share;

class ShareLimits
{
    public static function textCharacters(): int
    {
        return max((int) config('share.limits.text_characters', 10000), 1);
    }

    public static function uploadMegabytes(string $shareKind): int
    {
        return max((int) config("share.limits.upload_megabytes.{$shareKind}", 10), 1);
    }

    public static function uploadKilobytes(string $shareKind): int
    {
        return static::uploadMegabytes($shareKind) * 1024;
    }

    public static function forFrontend(): array
    {
        return [
            'textCharacters' => static::textCharacters(),
            'uploadMegabytes' => [
                Share::TYPE_IMAGE => static::uploadMegabytes(Share::TYPE_IMAGE),
                Share::TYPE_VIDEO => static::uploadMegabytes(Share::TYPE_VIDEO),
                Share::TYPE_AUDIO => static::uploadMegabytes(Share::TYPE_AUDIO),
                Share::TYPE_FILE => static::uploadMegabytes(Share::TYPE_FILE),
            ],
        ];
    }
}