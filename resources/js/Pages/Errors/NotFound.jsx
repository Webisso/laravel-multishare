import { Head, Link } from '@inertiajs/react';
import PublicShell from '@/Components/PublicShell';

export default function NotFound() {
    return (
        <>
            <Head title="404" />

            <PublicShell>
                <div className="mx-auto max-w-4xl">
                    <section className="rounded-[10px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12">
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-700">Error 404</p>
                        <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">404</h1>
                        <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Page not found</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
                            The page you are looking for could not be found. It may have been removed, renamed, or the link may be incorrect.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href={route('home')}
                                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                            >
                                Go to homepage
                            </Link>
                            <Link
                                href={route('shares.index')}
                                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                            >
                                Start sharing
                            </Link>
                        </div>
                    </section>
                </div>
            </PublicShell>
        </>
    );
}