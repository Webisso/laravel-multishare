<?php

namespace App\Support;

use App\Models\Share;
use Illuminate\Support\Carbon;

class ShareRetention
{
    public static function minutesFor(string $shareKind): int
    {
        $minutes = (int) config("share.expiration_minutes.{$shareKind}", 10080);

        return max($minutes, 1);
    }

    public static function expiresAt(string $shareKind): Carbon
    {
        return now()->addMinutes(static::minutesFor($shareKind));
    }

    public static function labelForKind(string $shareKind): string
    {
        return static::labelForMinutes(static::minutesFor($shareKind));
    }

    public static function allLabels(): array
    {
        return [
            Share::TYPE_TEXT => static::labelForKind(Share::TYPE_TEXT),
            Share::TYPE_IMAGE => static::labelForKind(Share::TYPE_IMAGE),
            Share::TYPE_VIDEO => static::labelForKind(Share::TYPE_VIDEO),
            Share::TYPE_AUDIO => static::labelForKind(Share::TYPE_AUDIO),
            Share::TYPE_FILE => static::labelForKind(Share::TYPE_FILE),
        ];
    }

    public static function labelForMinutes(int $minutes): string
    {
        $minutes = max($minutes, 1);

        if ($minutes % 1440 === 0) {
            $days = intdiv($minutes, 1440);

            return $days === 1 ? '1 day' : "{$days} days";
        }

        if ($minutes % 60 === 0) {
            $hours = intdiv($minutes, 60);

            return $hours === 1 ? '1 hour' : "{$hours} hours";
        }

        return $minutes === 1 ? '1 minute' : "{$minutes} minutes";
    }
}