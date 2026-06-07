import { Head, Link, useForm, usePage } from '@inertiajs/react';
import PublicShell from '@/Components/PublicShell';

const typeLabels = {
    text: 'Text',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    file: 'File',
};

const acceptedFileTypes = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    file: undefined,
};

const typeContent = {
    text: {
        eyebrow: 'Knowledge sharing',
        title: 'Publish fast notes, snippets, and announcements.',
        description:
            'Text shares are stored directly in MySQL, making them ideal for changelogs, release notes, support replies, and internal docs.',
        hint: 'Stored in the database, limited to 10,000 characters, and available instantly.',
        cta: 'Create text share',
        warningTitle: 'Text data policy',
        warningBody:
            'Do not publish passwords, tokens, API keys, personal identity numbers, or regulated personal data. Text shares are public by default.',
    },
    image: {
        eyebrow: 'Visual sharing',
        title: 'Deliver screenshots, mockups, and product visuals.',
        description:
            'Image shares are designed for landing page previews, design feedback, bug reports, and lightweight asset distribution.',
        hint: 'Public image link, 10 MB max, deleted automatically after 7 days.',
        cta: 'Upload image',
        warningTitle: 'Image publishing notice',
        warningBody:
            'Only upload content you own or have the right to distribute. Avoid publishing private screens, customer data, or confidential documents.',
    },
    video: {
        eyebrow: 'Rich media delivery',
        title: 'Share short demos, walkthroughs, and async updates.',
        description:
            'Video shares work well for launch previews, support recordings, product onboarding clips, and fast team communication.',
        hint: 'Best for short assets under 10 MB with automatic expiry after 7 days.',
        cta: 'Upload video',
        warningTitle: 'Video usage notice',
        warningBody:
            'Make sure everyone visible in the clip can be shared publicly and that no proprietary dashboards or client data appear on screen.',
    },
    audio: {
        eyebrow: 'Voice and audio',
        title: 'Send voice notes, sound previews, and spoken updates.',
        description:
            'Audio shares are useful for async feedback, support replies, quick approvals, and creative review workflows.',
        hint: 'Public audio URL, 10 MB max, and removed after 7 days.',
        cta: 'Upload audio',
        warningTitle: 'Audio sharing notice',
        warningBody:
            'Do not upload copyrighted music or recordings containing private or sensitive conversations without permission.',
    },
    file: {
        eyebrow: 'General files',
        title: 'Distribute documents, archives, and deliverables.',
        description:
            'Use generic file shares when you need a clean public delivery page for PDFs, ZIP archives, exports, and lightweight handoff packages.',
        hint: 'Supports any file type up to 10 MB and removes it automatically after 7 days.',
        cta: 'Upload file',
        warningTitle: 'File retention notice',
        warningBody:
            'Files are public and time-limited. Use this for temporary distribution, not permanent archival storage or compliance-sensitive material.',
    },
};

export default function Index({ shareTypes, initialShareType, shareLimits }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, progress, errors, reset } = useForm({
        title: '',
        share_kind: initialShareType,
        text_content: '',
        upload: null,
    });
    const textCharacterLimit = shareLimits?.textCharacters ?? 10000;
    const currentUploadLimit = shareLimits?.uploadMegabytes?.[data.share_kind] ?? 10;

    const activeContent = typeContent[data.share_kind];
    const submit = (event) => {
        event.preventDefault();

        post(route('shares.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset('title', 'text_content', 'upload');
                setData('share_kind', 'text');
            },
        });
    };

    const requiresFile = data.share_kind !== 'text';
    const setShareType = (nextType) => {
        setData('share_kind', nextType);

        if (nextType === 'text') {
            setData('upload', null);
            return;
        }

        setData('text_content', '');
    };

    return (
        <>
            <Head title="MultiShare" />

            <PublicShell currentType={data.share_kind} onTypeSelect={setShareType}>
                        <section className="mt-0">
                            <div className="mx-auto max-w-7xl">
                                <section className="rounded-[10px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Create share</p>
                                                <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                                                    {typeLabels[data.share_kind]}
                                                </h3>
                                        </div>
                                        <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                                                Public link
                                        </div>
                                    </div>

                                    {flash.success ? (
                                        <div className="mt-6 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                                            {flash.success}
                                        </div>
                                    ) : null}

                                    <form onSubmit={submit} className="mt-6 space-y-5">
                                        <div>
                                            <label className="text-sm font-semibold text-slate-700" htmlFor="title">
                                                Optional title
                                            </label>
                                            <input
                                                id="title"
                                                type="text"
                                                value={data.title}
                                                onChange={(event) => setData('title', event.target.value)}
                                                maxLength={120}
                                                className="mt-2 block w-full rounded-[10px] border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
                                                placeholder="Leave blank if you do not want to show a title"
                                            />
                                            <ErrorText message={errors.title} />
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <label className="text-sm font-semibold text-slate-700">Current share type</label>
                                                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                                                    {typeLabels[data.share_kind]}
                                                </span>
                                            </div>
                                            <ErrorText message={errors.share_kind} />
                                        </div>

                                        {requiresFile ? (
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700" htmlFor="upload">
                                                    Upload {typeLabels[data.share_kind].toLowerCase()}
                                                </label>
                                                <input
                                                    id="upload"
                                                    type="file"
                                                    accept={acceptedFileTypes[data.share_kind]}
                                                    onChange={(event) => setData('upload', event.target.files[0] ?? null)}
                                                    className="mt-2 block w-full rounded-[10px] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:font-semibold file:text-white hover:border-slate-400"
                                                />

                                                {data.upload ? (
                                                    <div className="mt-3 rounded-[10px] border border-slate-200 bg-slate-50 p-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{data.upload.name}</p>
                                                                <p className="mt-1 text-xs text-slate-500">{formatBytes(data.upload.size)} selected • {currentUploadLimit} MB max</p>
                                                            </div>
                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                                                                {processing && progress ? `${progress.percentage}%` : 'Ready'}
                                                            </span>
                                                        </div>

                                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                                                            <div
                                                                className="h-full rounded-full bg-sky-600 transition-all duration-300"
                                                                style={{ width: `${processing ? (progress?.percentage ?? 0) : 0}%` }}
                                                            />
                                                        </div>

                                                        <p className="mt-3 text-xs text-slate-500">
                                                            {processing
                                                                ? 'Uploading in the background. You can wait here until the transfer completes.'
                                                                : 'Upload starts asynchronously after you press publish.'}
                                                        </p>
                                                    </div>
                                                ) : null}

                                                <ErrorText message={errors.upload} />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <label className="text-sm font-semibold text-slate-700" htmlFor="text_content">
                                                        Text content
                                                    </label>
                                                    <span className="text-xs font-medium text-slate-500">{data.text_content.length}/{textCharacterLimit}</span>
                                                </div>
                                                <textarea
                                                    id="text_content"
                                                    value={data.text_content}
                                                    onChange={(event) => setData('text_content', event.target.value)}
                                                    maxLength={textCharacterLimit}
                                                    rows={12}
                                                    className="mt-2 block w-full rounded-[10px] border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
                                                    placeholder="Write your text"
                                                />
                                                <p className="mt-2 text-xs text-slate-500">Maximum {textCharacterLimit.toLocaleString()} characters.</p>
                                                <ErrorText message={errors.text_content} />
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <Link href={route('legal')} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                                                Terms and policies
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {processing && progress ? `Uploading ${progress.percentage}%` : processing ? 'Publishing...' : activeContent.cta}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        </section>
            </PublicShell>
        </>
    );
}

function ErrorText({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-2 text-sm text-rose-600">{message}</p>;
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