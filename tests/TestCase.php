<?php

namespace Tests;

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function inertiaHeaders(string $uri = '/'): array
    {
        $request = Request::create($uri, 'GET');
        $version = app(HandleInertiaRequests::class)->version($request);

        return array_filter([
            'X-Inertia' => 'true',
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Version' => $version,
        ]);
    }
}
