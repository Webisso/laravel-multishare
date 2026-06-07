# MultiShare

<p align="center">
	<strong>Temporary public sharing for text, images, video, audio, and files.</strong>
</p>

<p align="center">
	<img src="https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white" alt="PHP 8.3+">
	<img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13">
	<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827" alt="React 19">
	<img src="https://img.shields.io/badge/Inertia.js-v2-9553E9" alt="Inertia v2">
	<img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8">
	<img src="https://img.shields.io/badge/Storage-DigitalOcean%20Spaces-0080FF" alt="DigitalOcean Spaces">
	<img src="https://img.shields.io/badge/License-MIT-16A34A" alt="MIT License">
</p>

## Overview

MultiShare is a Laravel + React application for publishing temporary public share pages.

It supports five share types:

- Text
- Image
- Video
- Audio
- File

Text shares are stored in MySQL.
File-based shares are stored through Laravel's S3 filesystem integration and are designed to work with DigitalOcean Spaces.

The project is built around short-lived public delivery:

- Each share type has its own configurable expiration time in minutes.
- Expired share URLs stay on the same address and show an expiration warning instead of exposing content.
- Missing share URLs render a branded 404 page.
- Cleanup runs through a scheduled Laravel job.

## Highlights

- Public share pages for text and uploaded media.
- DigitalOcean Spaces compatible object storage.
- Per-type expiration settings in minutes.
- Per-type upload limits in megabytes and text character limits from config.
- Type-restricted uploads on both frontend and backend.
- Async file uploads with visible progress indicators.
- Copyable share links and content actions.
- Custom expired-share state and custom 404 page.
- Light public UI with a shared header/footer shell.

## Share Behavior

### Text shares

- Stored in the database.
- Subject to a configurable maximum character length.
- Expire automatically according to config.

### Image, video, audio, and file shares

- Uploaded to the configured storage disk.
- Subject to a configurable per-type file size limit.
- Use public preview pages when supported.
- Expire automatically according to config.

### Expired links

Expired links do not redirect and do not change the URL.
Instead, the share page renders a dedicated expired state explaining that the content is no longer available.

### Missing links

Non-existent share URLs render a custom 404 page with the same public header and footer as the rest of the site.

## Tech Stack

### Backend

- Laravel 13
- PHP 8.3+
- MySQL
- Laravel queues and scheduler
- S3 filesystem driver via `league/flysystem-aws-s3-v3`

### Frontend

- React
- Inertia.js
- Vite
- Tailwind CSS

### Storage and delivery

- DigitalOcean Spaces or any S3-compatible object storage

## Project Structure

Key files and directories:

- `app/Http/Controllers/ShareController.php`: main public share flow
- `app/Http/Requests/StoreShareRequest.php`: request validation
- `app/Jobs/PurgeExpiredShares.php`: cleanup job for expired shares
- `app/Models/Share.php`: share model and route key behavior
- `app/Support/ShareRetention.php`: retention helpers
- `app/Support/ShareLimits.php`: centralized upload and text limit helpers
- `config/share.php`: expiration and limit configuration
- `resources/js/Pages/Home.jsx`: public landing page
- `resources/js/Pages/Shares/Index.jsx`: share creation page
- `resources/js/Pages/Shares/Show.jsx`: share detail page
- `resources/js/Pages/Errors/NotFound.jsx`: branded 404 page
- `resources/js/Components/PublicShell.jsx`: shared public layout
- `tests/Feature/ShareTest.php`: focused feature coverage for share behavior
- `installation.md`: detailed deployment and installation notes

## Configuration

The most important project-specific configuration lives in `config/share.php`.

### 1. Expiration by share type

Each share type can expire on a different schedule, configured in minutes.

Example:

```php
'expiration_minutes' => [
		'text' => (int) env('SHARE_TEXT_EXPIRATION_MINUTES', 60),
		'image' => (int) env('SHARE_IMAGE_EXPIRATION_MINUTES', 10080),
		'video' => (int) env('SHARE_VIDEO_EXPIRATION_MINUTES', 1440),
		'audio' => (int) env('SHARE_AUDIO_EXPIRATION_MINUTES', 4320),
		'file' => (int) env('SHARE_FILE_EXPIRATION_MINUTES', 10080),
],
```

### 2. Limits by share type

Text uses a character limit.
File-based share types use megabyte limits.

Example:

```php
'limits' => [
		'text_characters' => (int) env('SHARE_TEXT_MAX_CHARACTERS', 10000),
		'upload_megabytes' => [
				'image' => (int) env('SHARE_IMAGE_MAX_MB', 10),
				'video' => (int) env('SHARE_VIDEO_MAX_MB', 10),
				'audio' => (int) env('SHARE_AUDIO_MAX_MB', 10),
				'file' => (int) env('SHARE_FILE_MAX_MB', 10),
		],
],
```

### 3. Environment variables

The following variables are available in `.env` / `.env.example`:

```env
SHARE_TEXT_EXPIRATION_MINUTES=10080
SHARE_IMAGE_EXPIRATION_MINUTES=10080
SHARE_VIDEO_EXPIRATION_MINUTES=10080
SHARE_AUDIO_EXPIRATION_MINUTES=10080
SHARE_FILE_EXPIRATION_MINUTES=10080

SHARE_TEXT_MAX_CHARACTERS=10000
SHARE_IMAGE_MAX_MB=10
SHARE_VIDEO_MAX_MB=10
SHARE_AUDIO_MAX_MB=10
SHARE_FILE_MAX_MB=10
```

## Upload Validation

Upload restrictions are enforced in two places:

### Frontend

- `accept="image/*"` for image uploads
- `accept="video/*"` for video uploads
- `accept="audio/*"` for audio uploads
- Async upload progress UI for file-based share types

### Backend

- MIME-type validation by selected share kind
- Config-driven max size validation
- Config-driven text character validation

This means the browser helps guide the user, and the API still enforces the rules even if the frontend is bypassed.

## Video Preview Rules

Some video containers and codecs are not reliable in the browser `<video>` element.

Inline playback is kept for broadly compatible formats such as:

- MP4
- WebM
- Ogg video

Formats such as the following open through a fallback preview card and can be opened in a new tab instead:

- AVI
- MOV
- WMV
- FLV
- MKV
- MPEG
- MPG
- 3GP

## User Experience Details

### Public shell

All public-facing pages share a common header and footer through `PublicShell`.

### Landing page

The homepage is a simple marketing-style landing page with direct navigation into each share type.

### Upload page

The upload page includes:

- Per-type selection
- Optional title
- Config-driven text counter
- File selection with async upload progress
- Type-aware file picker restrictions

### Share detail page

The share detail page includes:

- Text rendering with “Show more” for long content
- Image previews constrained to avoid oversized cards
- Video fallback behavior for unsupported formats
- Countdown to expiration
- Compact detail rows instead of oversized cards
- Copy actions for links and text-based fields

## Storage

This project is set up for public object URLs through DigitalOcean Spaces.

Important notes:

- `SHARE_FILESYSTEM_DISK` controls which filesystem disk is used for uploads.
- The app builds public URLs carefully from disk configuration and stored paths.
- Region and endpoint must match your Spaces configuration.

Example:

```env
FILESYSTEM_DISK=s3
SHARE_FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=ams3
AWS_BUCKET=your-space-name
AWS_URL=https://your-space-name.ams3.digitaloceanspaces.com
AWS_ENDPOINT=https://ams3.digitaloceanspaces.com
AWS_USE_PATH_STYLE_ENDPOINT=false
```

## Cleanup and Scheduling

Expired shares are removed by the `PurgeExpiredShares` job.

This requires:

- a running queue worker
- a scheduler entry calling `php artisan schedule:run`

Example cron:

```cron
* * * * * cd /absolute/path/to/multishare && php artisan schedule:run >> /dev/null 2>&1
```

## Local Development

### Requirements

- PHP 8.3+
- Composer 2+
- Node.js 20+
- npm
- MySQL 8+
- DigitalOcean Spaces or another S3-compatible bucket

### Install

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### Development services

Use separate terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

```bash
php artisan queue:work
```

### Production build

```bash
npm run build
```

## Testing

Focused feature tests cover:

- text creation
- text newline normalization
- MIME-type rejection for mismatched uploads
- config-driven upload size limits
- file URL generation
- cleanup of expired records
- expired-share rendering
- custom 404 rendering

Run tests with:

```bash
php artisan test
```

Or run the focused suite:

```bash
php artisan test tests/Feature/ShareTest.php tests/Feature/ExampleTest.php
```

## Documentation

Additional installation and deployment notes are available in `installation.md`.

## License

This project is released under the MIT license.
