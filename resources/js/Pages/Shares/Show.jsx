import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicShell from '@/Components/PublicShell';

const typeLabels = {
    text: 'Text',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    file: 'File',
};

const inlineVideoMimeTypes = new Set([
    'video/mp4',
    'video/webm',
    'video/ogg',
]);

const inlineVideoExtensions = new Set(['mp4', 'webm', 'ogv']);

const downloadOnlyVideoExtensions = ['avi', 'mov', 'wmv', 'flv', 'mkv', 'mpeg', 'mpg', '3gp'];

export default function Show({ share }) {
    const { flash } = usePage().props;
    const hasTitle = Boolean(share.title?.trim());
    const pageTitle = share.is_expired
        ? 'Expired share'
        : share.title || share.original_name || `Shared ${typeLabels[share.share_kind].toLowerCase()}`;

    return (
        <>
            <Head title={pageTitle} />

            <PublicShell currentType={share.share_kind}>
                <div className="mx-auto max-w-7xl">
                    {flash.success ? (
                        <div className="mt-6 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {flash.success}
                        </div>
                    ) : null}

                    {share.is_expired ? (
                        <ExpiredShareState share={share} />
                    ) : (
                        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
                        <section className="rounded-[10px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
                            {hasTitle ? (
                                <div className="border-b border-slate-200 pb-6">
                                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                                        {typeLabels[share.share_kind]}
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                                            {share.title}
                                        </h1>
                                        <CopyButton value={share.title} label="Copy title" />
                                    </div>
                                </div>
                            ) : null}

                            <div className={hasTitle ? 'mt-6' : ''}>
                                {share.is_text ? <TextShare share={share} /> : <FileShare share={share} />}
                            </div>

                            {!share.is_text ? (
                                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                                    <Link
                                        href={route('shares.index', { type: share.share_kind })}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                                    >
                                        Create another share
                                    </Link>
                                    <a
                                        href={share.storage_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                                    >
                                        Open file
                                    </a>
                                    <Link
                                        href={route('legal')}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                                    >
                                        View terms and policies
                                    </Link>
                                </div>
                            ) : null}
                        </section>

                        <aside className="rounded-[10px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8">
                            <h2 className="text-lg font-black tracking-tight text-slate-950">Share details</h2>

                            <ShareUrlCard />

                            <ExpiryCountdownCard expiresAt={share.expires_at} retentionLabel={share.retention_label} />

                            <dl className="mt-6 divide-y divide-slate-200 rounded-[10px] border border-slate-200 bg-slate-50 px-4">
                                <DetailCard label="Type" value={typeLabels[share.share_kind]} />
                                <DetailCard label="Created" value={formatDate(share.created_at)} />
                                {share.is_file ? <DetailCard label="Size" value={formatBytes(share.size)} /> : null}
                                <DetailCard label="Expires" value={formatDate(share.expires_at)} />
                                <DetailCard
                                    label="Policy"
                                    value={share.is_file ? 'Temporary public file share' : 'Temporary public text share'}
                                />
                            </dl>

                            {share.is_text ? (
                                <div className="mt-6 flex flex-col gap-3">
                                    <Link
                                        href={route('shares.index', { type: share.share_kind })}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                                    >
                                        Create another share
                                    </Link>
                                    <Link
                                        href={route('legal')}
                                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                                    >
                                        View terms and policies
                                    </Link>
                                </div>
                            ) : null}
                        </aside>
                        </div>
                    )}
                </div>
            </PublicShell>
        </>
    );
}

function ExpiredShareState({ share }) {
    return (
        <section className="mt-6 rounded-[10px] border border-amber-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Expired content</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">This share is no longer available</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                This content has passed its usage period and can no longer be viewed from this link.
            </p>

            <dl className="mt-8 divide-y divide-slate-200 rounded-[10px] border border-slate-200 bg-slate-50 px-4">
                <DetailCard label="Type" value={typeLabels[share.share_kind]} />
                <DetailCard label="Created" value={formatDate(share.created_at)} />
                <DetailCard label="Expired" value={formatDate(share.expires_at)} />
                <DetailCard label="Policy" value={`This ${share.share_kind} share expired after ${share.retention_label}.`} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
                <Link
                    href={route('shares.index', { type: share.share_kind })}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                    Create another share
                </Link>
                <Link
                    href={route('home')}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                >
                    Go to homepage
                </Link>
            </div>
        </section>
    );
}

function TextShare({ share }) {
    const textContent = share.text_content || '';
    const shouldClamp = textContent.length > 1400 || textContent.split('\n').length > 18;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">Shared text</h2>
                <CopyButton value={textContent} label="Copy text" />
            </div>

            <div className="relative mt-5">
                <pre
                    className={`overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-slate-50 p-5 text-sm leading-7 text-slate-800 ${shouldClamp && !isExpanded ? 'max-h-[26rem] overflow-hidden' : ''}`}
                >
                    {textContent}
                </pre>

                {shouldClamp && !isExpanded ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 rounded-b-[10px] bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent" />
                ) : null}
            </div>

            {shouldClamp ? (
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => setIsExpanded((current) => !current)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function FileShare({ share }) {
    const kind = share.share_kind;

    if (kind === 'image') {
        return (
            <img
                src={share.storage_url}
                alt={share.title || share.original_name || 'Shared image'}
                className="mx-auto max-h-[42rem] max-w-[500px] w-full rounded-[10px] border border-slate-100 bg-white object-contain"
            />
        );
    }

    if (kind === 'video') {
        const inlinePlayable = isInlinePlayableVideo(share);

        if (!inlinePlayable) {
            return <VideoDownloadFallback share={share} />;
        }

        return (
            <video controls className="w-full rounded-[10px] bg-slate-950">
                <source src={share.storage_url} type={share.mime_type || undefined} />
            </video>
        );
    }

    if (kind === 'audio') {
        return (
            <div className="rounded-[10px] bg-slate-50 p-6">
                <p className="text-sm text-slate-500">Audio preview</p>
                <audio controls className="mt-4 w-full">
                    <source src={share.storage_url} type={share.mime_type || undefined} />
                </audio>
            </div>
        );
    }

    return (
        <div className="rounded-[10px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Downloadable file</p>
            <p className="mt-3 text-xl font-semibold text-slate-950">{share.original_name}</p>
            <p className="mt-2 text-sm text-slate-600">
                This file is stored in DigitalOcean Spaces and remains available for {share.retention_label}.
            </p>
        </div>
    );
}

function VideoDownloadFallback({ share }) {
    return (
        <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-5">
            <a href={share.storage_url} target="_blank" rel="noreferrer" className="block">
                <img
                    src="/video.avif"
                    alt="Open video in a new tab"
                    className="w-full rounded-[10px] border border-slate-200 bg-white object-cover"
                />
            </a>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-950">This video opens in a new tab</p>
                    <p className="mt-1 text-sm text-slate-600">
                        Some video containers and codecs are not reliably supported by the browser video tag.
                    </p>
                </div>
                <a
                    href={share.storage_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                    Open video
                </a>
            </div>

            <div className="mt-4 rounded-[10px] border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Formats opened outside the page
                </p>
                <p className="mt-2 text-sm text-slate-700">{downloadOnlyVideoExtensions.map((extension) => extension.toUpperCase()).join(', ')}</p>
            </div>
        </div>
    );
}

function DetailCard({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 text-left">
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{label}</dt>
            <dd className="text-right text-sm font-medium text-slate-800">{value || 'N/A'}</dd>
        </div>
    );
}

function ShareUrlCard() {
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    return (
        <div className="mt-6 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Share URL</p>
            <input
                type="text"
                value={currentUrl}
                readOnly
                className="mt-3 block w-full rounded-[10px] border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            />
            <div className="mt-3">
                <CopyButton value={currentUrl} label="Copy link" />
            </div>
        </div>
    );
}

function ExpiryCountdownCard({ expiresAt, retentionLabel }) {
    const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt));

    useEffect(() => {
        setTimeLeft(getTimeLeft(expiresAt));

        if (!expiresAt) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setTimeLeft(getTimeLeft(expiresAt));
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [expiresAt]);

    return (
        <div className="mt-6 rounded-[10px] border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">Auto delete in</p>
            <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatRemainingTime(timeLeft)}</p>
            <p className="mt-2 text-sm text-slate-600">
                This share is automatically deleted after {retentionLabel || 'the configured retention period'}.
            </p>
        </div>
    );
}

function CopyButton({ value, label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!value) {
            return;
        }

        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
        >
            {copied ? 'Copied' : label}
        </button>
    );
}

function formatDate(value) {
    if (!value) {
        return null;
    }

    return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function getTimeLeft(expiresAt) {
    if (!expiresAt) {
        return 0;
    }

    return Math.max(new Date(expiresAt).getTime() - Date.now(), 0);
}

function isInlinePlayableVideo(share) {
    const mimeType = (share.mime_type || '').toLowerCase();
    const extension = getFileExtension(share.original_name);

    if (inlineVideoMimeTypes.has(mimeType)) {
        return true;
    }

    if (downloadOnlyVideoExtensions.includes(extension)) {
        return false;
    }

    return inlineVideoExtensions.has(extension);
}

function getFileExtension(fileName) {
    if (!fileName || !fileName.includes('.')) {
        return '';
    }

    return fileName.split('.').pop().toLowerCase();
}

function formatRemainingTime(milliseconds) {
    if (milliseconds <= 0) {
        return 'Expired';
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

function formatBytes(value) {
    if (!value) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}