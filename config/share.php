<?php

return [
    'expiration_minutes' => [
        'text' => (int) env('SHARE_TEXT_EXPIRATION_MINUTES', 1),
        'image' => (int) env('SHARE_IMAGE_EXPIRATION_MINUTES', 10080),
        'video' => (int) env('SHARE_VIDEO_EXPIRATION_MINUTES', 10080),
        'audio' => (int) env('SHARE_AUDIO_EXPIRATION_MINUTES', 10080),
        'file' => (int) env('SHARE_FILE_EXPIRATION_MINUTES', 10080),
    ],

    'limits' => [
        'text_characters' => (int) env('SHARE_TEXT_MAX_CHARACTERS', 10000),
        'upload_megabytes' => [
            'image' => (int) env('SHARE_IMAGE_MAX_MB', 10),
            'video' => (int) env('SHARE_VIDEO_MAX_MB', 10),
            'audio' => (int) env('SHARE_AUDIO_MAX_MB', 10),
            'file' => (int) env('SHARE_FILE_MAX_MB', 10),
        ],
    ],
];