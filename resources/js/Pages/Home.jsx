import { Head, Link } from '@inertiajs/react';
import PublicShell from '@/Components/PublicShell';

const shareTypes = [
    {
        value: 'text',
        label: 'Text shares',
        description: 'Publish notes, changelogs, internal updates, and quick snippets with a public link.',
    },
    {
        value: 'image',
        label: 'Image shares',
        description: 'Send screenshots, mockups, and visual references without extra setup.',
    },
    {
        value: 'video',
        label: 'Video shares',
        description: 'Deliver short demos, walkthroughs, and preview clips with a temporary link.',
    },
    {
        value: 'audio',
        label: 'Audio shares',
        description: 'Share voice notes, approvals, or sound previews in a clean public page.',
    },
    {
        value: 'file',
        label: 'File shares',
        description: 'Upload documents, archives, exports, and handoff files up to 10 MB.',
    },
];

export default function Home({ retentionLabels }) {
    const highlights = [
        'Public links in seconds',
        'Text in database, files in Spaces',
        'Type-based automatic deletion',
    ];

    return (
        <>
            <Head title="MultiShare" />

            <PublicShell>
                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
                    <div className="rounded-[10px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">Simple public sharing</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                            Share files, media, and text with a clean public link.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                            MultiShare is built for quick client delivery, internal handoffs, support replies, and temporary public publishing. Upload once, send the link, and let the platform clean up automatically.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route('shares.index')}
                                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                                Start sharing
                            </Link>
                            <Link
                                href={route('legal')}
                                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                            >
                                View terms and policies
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {highlights.map((item) => (
                                <div key={item} className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[10px] border border-slate-200 bg-[linear-gradient(180deg,#f0f9ff_0%,#ffffff_100%)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">What it is for</p>
                        <div className="mt-5 space-y-4">
                            <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-950">Fast delivery</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">Useful for sending assets, previews, notes, and files without setting up a full portal.</p>
                            </div>
                            <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-950">Temporary by design</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">Every share type can have its own retention window, configured in minutes for short-lived public delivery.</p>
                            </div>
                            <div className="rounded-[10px] border border-slate-200 bg-white p-4">
                                <p className="text-sm font-semibold text-slate-950">Works across share types</p>
                                <p className="mt-2 text-sm leading-7 text-slate-600">Text, image, video, audio, and generic file uploads all use the same clean public flow.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6 rounded-[10px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">Share types</p>
                            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Choose how you want to publish</h2>
                        </div>
                        <Link
                            href={route('shares.index')}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                        >
                            Open uploader
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {shareTypes.map((item) => (
                            <Link
                                key={item.value}
                                href={route('shares.index', { type: item.value })}
                                className="group rounded-[10px] border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
                            >
                                <p className="text-sm font-black tracking-tight text-slate-950">{item.label}</p>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                                    Auto deletes after {retentionLabels[item.value]}
                                </p>
                                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Open {item.value}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </PublicShell>
        </>
    );
}