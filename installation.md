# MultiShare Installation Guide

This project is a Laravel + React application for sharing text, images, videos, audio, and general files.

Text shares are stored in MySQL.
File-based shares are stored through the Laravel S3 driver, which works with DigitalOcean Spaces.
Uploaded files are limited to 10 MB and are removed automatically after 7 days by a scheduled Laravel job.

## 1. Requirements

- PHP 8.3 or newer
- Composer 2.x
- Node.js 20+ and npm
- MySQL 8+
- A DigitalOcean Spaces bucket

## 2. Clone the project

```bash
git clone <your-repository-url> multishare
cd multishare
```

## 3. Install backend dependencies

```bash
composer install
```

## 4. Install frontend dependencies

```bash
npm install
```

## 5. Create the environment file

```bash
cp .env.example .env
```

## 6. Configure the application key

```bash
php artisan key:generate
```

## 7. Configure MySQL

Create a MySQL database named `multishare`.

Use these values in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=multishare
DB_USERNAME=root
DB_PASSWORD=
```

The password is intentionally empty because that is what you provided.

## 8. Configure DigitalOcean Spaces

Set these values in `.env` with your real DigitalOcean Spaces credentials:

```env
FILESYSTEM_DISK=s3
SHARE_FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=your-region
AWS_BUCKET=your-space-name
AWS_URL=https://your-space-name.your-region.digitaloceanspaces.com
AWS_ENDPOINT=https://your-region.digitaloceanspaces.com
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Notes:

- `AWS_DEFAULT_REGION` should be your DigitalOcean Spaces region such as `nyc3`, `fra1`, or `sgp1`.
- `AWS_BUCKET` must be your Space name.
- `AWS_URL` should point to the public bucket URL or CDN URL if you use a CDN.
- The current share pages use the stored file URL for previews, so your Space objects must be publicly reachable.

## 9. Configure queue and session storage

These values should stay enabled in `.env`:

```env
QUEUE_CONNECTION=database
SESSION_DRIVER=database
CACHE_STORE=database
```

## 10. Run database migrations

```bash
php artisan migrate
```

This creates:

- Laravel default tables
- Queue tables
- Cache tables
- Session tables
- The `shares` table used by MultiShare

## 11. Build frontend assets

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
```

## 12. Start the local application

Use separate terminals.

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Terminal 3:

```bash
php artisan queue:work
```

## 13. Enable scheduled cleanup

The project schedules the `PurgeExpiredShares` job every hour.

On Linux or macOS, add this cron entry:

```cron
* * * * * cd /absolute/path/to/multishare && php artisan schedule:run >> /dev/null 2>&1
```

This cron entry is required so the scheduler can dispatch the cleanup job.

## 14. Optional production checks

Run these commands before deployment:

```bash
php artisan test
npm run build
```

## 15. Deployment summary

For production, make sure all of the following are running:

- Your web server pointing to Laravel
- MySQL database `multishare`
- DigitalOcean Spaces credentials in `.env`
- A queue worker such as `php artisan queue:work`
- A scheduler cron job calling `php artisan schedule:run`

## 16. Feature summary

- Text shares are limited to 10,000 characters.
- Images, videos, audio, and files are limited to 10 MB.
- File uploads expire after 7 days.
- Cleanup runs through a scheduled Laravel job.
- The UI is fully in English.