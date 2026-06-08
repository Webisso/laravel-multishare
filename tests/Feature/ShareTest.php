<?php

namespace Tests\Feature;

use App\Jobs\PurgeExpiredShares;
use App\Models\Share;
use App\Support\ShareRetention;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ShareTest extends TestCase
{
    use RefreshDatabase;

    public function test_text_share_can_be_created_without_a_title(): void
    {
        config()->set('share.expiration_minutes.text', 90);

        $response = $this->post(route('shares.store'), [
            'share_kind' => Share::TYPE_TEXT,
            'text_content' => str_repeat('A', 250),
        ]);

        $share = Share::first();

        $response->assertRedirect(route('shares.show', $share));

        $this->assertDatabaseHas('shares', [
            'public_id' => $share->public_id,
            'share_kind' => Share::TYPE_TEXT,
            'title' => null,
        ]);
        $this->assertNotNull($share->expires_at);
        $this->assertTrue($share->expires_at->between(now()->addMinutes(90)->subMinute(), now()->addMinutes(90)->addMinute()));
    }

    public function test_text_share_with_windows_line_breaks_can_use_the_full_limit(): void
    {
        config()->set('share.limits.text_characters', 10000);

        $textContent = str_repeat("a\r\n", 5000);

        $response = $this->post(route('shares.store'), [
            'share_kind' => Share::TYPE_TEXT,
            'title' => 'Long text',
            'text_content' => $textContent,
        ]);

        $share = Share::query()->latest('id')->first();
        $response->assertRedirect(route('shares.show', $share));
        $this->assertStringNotContainsString("\r", $share->text_content);
        $this->assertLessThanOrEqual(10000, mb_strlen($share->text_content));
    }

    public function test_text_share_can_be_downloaded_as_a_text_file(): void
    {
        $share = Share::create([
            'public_id' => '01JXTEXTDOWNLOAD00000000000',
            'share_kind' => Share::TYPE_TEXT,
            'title' => 'Meeting Notes',
            'text_content' => "line one\nline two",
            'expires_at' => now()->addHour(),
        ]);

        $response = $this->get(route('shares.download', $share));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/plain; charset=UTF-8');
        $response->assertHeader('content-disposition', 'attachment; filename=meeting-notes.txt');
        $response->assertStreamedContent("line one\nline two");
    }

    public function test_file_share_must_be_under_ten_megabytes(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');

        $response = $this->from(route('shares.index'))->post(route('shares.store'), [
            'share_kind' => Share::TYPE_FILE,
            'upload' => UploadedFile::fake()->create('archive.zip', 11000),
        ]);

        $response->assertRedirect(route('shares.index'));
        $response->assertSessionHasErrors('upload');
    }

    public function test_image_share_rejects_non_image_uploads(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');

        $response = $this->from(route('shares.index', ['type' => Share::TYPE_IMAGE]))->post(route('shares.store'), [
            'share_kind' => Share::TYPE_IMAGE,
            'upload' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
        ]);

        $response->assertRedirect(route('shares.index', ['type' => Share::TYPE_IMAGE]));
        $response->assertSessionHasErrors('upload');
        $this->assertDatabaseCount('shares', 0);
    }

    public function test_image_share_uses_the_configured_upload_limit(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');
        config()->set('share.limits.upload_megabytes.image', 1);

        $response = $this->from(route('shares.index', ['type' => Share::TYPE_IMAGE]))->post(route('shares.store'), [
            'share_kind' => Share::TYPE_IMAGE,
            'upload' => UploadedFile::fake()->image('large.png')->size(1100),
        ]);

        $response->assertRedirect(route('shares.index', ['type' => Share::TYPE_IMAGE]));
        $response->assertSessionHasErrors('upload');
        $this->assertDatabaseCount('shares', 0);
    }

    public function test_file_share_can_be_created_without_a_title_and_has_a_public_url(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');
        config()->set('filesystems.disks.s3.url', 'https://example.test/bucket');
        config()->set('share.expiration_minutes.image', 45);

        $response = $this->post(route('shares.store'), [
            'share_kind' => Share::TYPE_IMAGE,
            'upload' => UploadedFile::fake()->image('screenshot.png'),
        ]);

        $share = Share::query()->latest('id')->first();

        $response->assertRedirect(route('shares.show', $share));
        $this->assertNull($share->title);
        $this->assertNotNull($share->storage_path);
        $this->assertSame('https://example.test/bucket/'.ltrim($share->storage_path, '/'), $share->storage_url);
        $this->assertTrue($share->expires_at->between(now()->addMinutes(45)->subMinute(), now()->addMinutes(45)->addMinute()));
    }

    public function test_file_share_can_be_downloaded_from_storage(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');

        Storage::disk('s3')->put('shares/demo/report.pdf', 'pdf-content');

        $share = Share::create([
            'public_id' => '01JXFILEDOWNLOAD00000000000',
            'share_kind' => Share::TYPE_FILE,
            'storage_disk' => 's3',
            'storage_path' => 'shares/demo/report.pdf',
            'storage_url' => 'https://example.test/report.pdf',
            'original_name' => 'report.pdf',
            'mime_type' => 'application/pdf',
            'size' => 11,
            'expires_at' => now()->addHour(),
        ]);

        $response = $this->get(route('shares.download', $share));

        $response->assertOk();
        $response->assertHeader('content-disposition', 'attachment; filename=report.pdf');
    }

    public function test_expired_file_shares_are_removed_from_storage_and_database(): void
    {
        Storage::fake('s3');
        config()->set('filesystems.share', 's3');

        Storage::disk('s3')->put('shares/demo/file.txt', 'temporary data');

        $share = Share::create([
            'public_id' => '01JXTESTSHARE00000000000000',
            'share_kind' => Share::TYPE_FILE,
            'storage_disk' => 's3',
            'storage_path' => 'shares/demo/file.txt',
            'storage_url' => 'https://example.test/file.txt',
            'original_name' => 'file.txt',
            'mime_type' => 'text/plain',
            'size' => 14,
            'expires_at' => now()->subHour(),
        ]);

        app(PurgeExpiredShares::class)->handle();

        Storage::disk('s3')->assertMissing('shares/demo/file.txt');
        $this->assertDatabaseMissing('shares', ['id' => $share->id]);
    }

    public function test_expired_text_shares_are_removed_from_database(): void
    {
        $share = Share::create([
            'public_id' => '01JXTESTTEXT000000000000000',
            'share_kind' => Share::TYPE_TEXT,
            'text_content' => 'temporary text',
            'expires_at' => now()->subHour(),
        ]);

        app(PurgeExpiredShares::class)->handle();

        $this->assertDatabaseMissing('shares', ['id' => $share->id]);
    }

    public function test_expired_shares_show_an_expired_message_without_exposing_content(): void
    {
        $share = Share::create([
            'public_id' => '01JXTESTEXPIRED000000000000',
            'share_kind' => Share::TYPE_TEXT,
            'text_content' => 'expired text',
            'expires_at' => now()->subMinute(),
        ]);

        $this->get(route('shares.show', $share))
            ->assertOk()
            ->assertSee('is_expired', false)
            ->assertDontSee('expired text');
    }

    public function test_missing_share_routes_render_the_custom_not_found_page(): void
    {
        $this->get('/shares/01JXDOESNOTEXIST000000000000')
            ->assertNotFound()
            ->assertSee('Errors\\/NotFound', false);
    }
}