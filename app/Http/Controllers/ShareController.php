<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreShareRequest;
use App\Models\Share;
use App\Support\ShareLimits;
use App\Support\ShareRetention;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ShareController extends Controller
{
    public function index(Request $request): Response
    {
        $shareTypes = [
            Share::TYPE_TEXT,
            Share::TYPE_IMAGE,
            Share::TYPE_VIDEO,
            Share::TYPE_AUDIO,
            Share::TYPE_FILE,
        ];

        $initialShareType = $request->string('type')->toString();

        if (! in_array($initialShareType, $shareTypes, true)) {
            $initialShareType = Share::TYPE_TEXT;
        }

        return Inertia::render('Shares/Index', [
            'shareTypes' => $shareTypes,
            'initialShareType' => $initialShareType,
            'retentionLabels' => ShareRetention::allLabels(),
            'shareLimits' => ShareLimits::forFrontend(),
        ]);
    }

    public function store(StoreShareRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $shareKind = $validated['share_kind'];
        $expiresAt = ShareRetention::expiresAt($shareKind);

        $share = new Share([
            'public_id' => (string) Str::ulid(),
            'share_kind' => $shareKind,
            'title' => $validated['title'] ?? null,
            'expires_at' => $expiresAt,
        ]);

        if ($shareKind === Share::TYPE_TEXT) {
            $share->text_content = $validated['text_content'];
        } else {
            $file = $request->file('upload');
            $mimeType = $file?->getMimeType() ?: $file?->getClientMimeType();

            if (! $file || ! $mimeType || ! $this->matchesExpectedFileType($shareKind, $mimeType)) {
                return back()
                    ->withErrors(['upload' => 'The selected file does not match the chosen share type.'])
                    ->withInput();
            }

            $disk = (string) config('filesystems.share', 's3');
            $path = $file->storePublicly('shares/'.$share->public_id, $disk);

            $share->fill([
                'storage_disk' => $disk,
                'storage_path' => $path,
                'storage_url' => $this->buildPublicUrl($disk, $path),
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $mimeType,
                'size' => $file->getSize(),
            ]);
        }

        $share->save();

        return redirect()
            ->route('shares.show', $share)
            ->with('success', 'Your share is live.');
    }

    public function show(Share $share): Response
    {
        if ($share->expires_at && $share->expires_at->isPast()) {
            return Inertia::render('Shares/Show', [
                'share' => $this->transformExpiredShare($share),
            ]);
        }

        return Inertia::render('Shares/Show', [
            'share' => $this->transformShare($share, true),
        ]);
    }

    public function download(Share $share): HttpResponse
    {
        abort_if($share->expires_at && $share->expires_at->isPast(), 404);

        if ($share->isTextShare()) {
            $fileName = $this->textDownloadFileName($share);

            return response()->streamDownload(function () use ($share): void {
                echo $share->text_content ?? '';
            }, $fileName, [
                'Content-Type' => 'text/plain; charset=UTF-8',
            ]);
        }

        $disk = $share->storage_disk ?: (string) config('filesystems.share', 's3');

        abort_unless($share->storage_path, 404);

        return Storage::disk($disk)->download(
            $share->storage_path,
            $share->original_name ?: basename($share->storage_path)
        );
    }

    protected function transformShare(Share $share, bool $includeContent): array
    {
        return [
            'public_id' => $share->public_id,
            'share_kind' => $share->share_kind,
            'title' => $share->title,
            'text_content' => $includeContent ? $share->text_content : null,
            'excerpt' => $share->isTextShare()
                ? Str::limit((string) $share->text_content, 140)
                : $share->original_name,
            'storage_url' => $share->storage_path
                ? $this->buildPublicUrl($share->storage_disk ?: (string) config('filesystems.share', 's3'), $share->storage_path)
                : $share->storage_url,
            'original_name' => $share->original_name,
            'mime_type' => $share->mime_type,
            'size' => $share->size,
            'expires_at' => $share->expires_at?->toIso8601String(),
            'retention_label' => ShareRetention::labelForKind($share->share_kind),
            'created_at' => $share->created_at?->toIso8601String(),
            'is_text' => $share->isTextShare(),
            'is_file' => $share->isFileShare(),
            'is_expired' => false,
        ];
    }

    protected function transformExpiredShare(Share $share): array
    {
        return [
            'public_id' => $share->public_id,
            'share_kind' => $share->share_kind,
            'title' => $share->title,
            'text_content' => null,
            'excerpt' => null,
            'storage_url' => null,
            'original_name' => $share->original_name,
            'mime_type' => $share->mime_type,
            'size' => $share->size,
            'expires_at' => $share->expires_at?->toIso8601String(),
            'retention_label' => ShareRetention::labelForKind($share->share_kind),
            'created_at' => $share->created_at?->toIso8601String(),
            'is_text' => $share->isTextShare(),
            'is_file' => $share->isFileShare(),
            'is_expired' => true,
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

    protected function buildPublicUrl(string $disk, string $path): string
    {
        $normalizedPath = ltrim($path, '/');
        $diskConfig = (array) config("filesystems.disks.{$disk}", []);
        $configuredUrl = rtrim((string) ($diskConfig['url'] ?? ''), '/');

        if ($configuredUrl !== '') {
            return $configuredUrl.'/'.$normalizedPath;
        }

        $endpoint = rtrim((string) ($diskConfig['endpoint'] ?? ''), '/');
        $bucket = (string) ($diskConfig['bucket'] ?? '');

        if ($endpoint !== '' && $bucket !== '') {
            $usesPathStyleEndpoint = filter_var($diskConfig['use_path_style_endpoint'] ?? false, FILTER_VALIDATE_BOOL);

            if ($usesPathStyleEndpoint) {
                return $endpoint.'/'.$bucket.'/'.$normalizedPath;
            }

            $parts = parse_url($endpoint);

            if (is_array($parts) && isset($parts['scheme'], $parts['host'])) {
                $url = $parts['scheme'].'://'.$bucket.'.'.$parts['host'];

                if (isset($parts['port'])) {
                    $url .= ':'.$parts['port'];
                }

                return $url.'/'.$normalizedPath;
            }
        }

        return Storage::disk($disk)->url($path);
    }

    protected function textDownloadFileName(Share $share): string
    {
        $baseName = $share->title
            ? Str::slug($share->title)
            : 'share-'.$share->public_id;

        return ($baseName !== '' ? $baseName : 'share-'.$share->public_id).'.txt';
    }
}
