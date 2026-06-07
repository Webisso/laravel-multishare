<?php

namespace App\Jobs;

use App\Models\Share;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class PurgeExpiredShares implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Share::query()
            ->expired()
            ->orderBy('id')
            ->chunkById(100, function ($shares): void {
                foreach ($shares as $share) {
                    if ($share->storage_disk && $share->storage_path) {
                        Storage::disk($share->storage_disk)->delete($share->storage_path);
                    }

                    $share->delete();
                }
            });
    }
}
