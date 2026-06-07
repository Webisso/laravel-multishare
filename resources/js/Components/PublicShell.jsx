import { Link } from '@inertiajs/react';

const shareTypes = [
    { value: 'text', label: 'Text' },
    { value: 'image', label: 'Image' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'file', label: 'File' },
];

export default function PublicShell({ children, currentType = null, onTypeSelect = null }) {
    return (
        <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_38%,#eef6f7_100%)] text-slate-900">
            <header className="border-b border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <Link href={route('home')} className="block">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-sm font-black text-white">
                                M
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-slate-950">MultiShare</h1>
                                <p className="text-sm text-slate-500">Deploy-ready public sharing for your live domain.</p>
                            </div>
                        </div>
                    </Link>

                    <nav className="flex flex-wrap gap-2">
                        {shareTypes.map((shareType) => {
                            const isActive = currentType === shareType.value;

                            if (onTypeSelect) {
                                return (
                                    <button
                                        key={shareType.value}
                                        type="button"
                                        onClick={() => onTypeSelect(shareType.value)}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                            isActive
                                                ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {shareType.label}
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={shareType.value}
                                    href={route('shares.index', { type: shareType.value })}
                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                        isActive
                                            ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {shareType.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <main className="flex-1 px-6 py-8 lg:px-8 lg:py-10">
                <div className="mx-auto max-w-7xl">{children}</div>
            </main>

            <footer className="border-t border-white/80 bg-white/90 px-6 py-6 text-sm text-slate-500 shadow-[0_-12px_40px_rgba(15,23,42,0.04)] backdrop-blur lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p>MultiShare is an open-source public sharing experience for modern teams, clients, and communities.</p>
                        <p className="mt-2 text-xs text-slate-400">Operated by WebissoLLC • hello@webisso.com • +1 209 208 0078</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link href={route('legal')} className="font-semibold text-slate-700 hover:text-sky-700">
                            Terms of Service
                        </Link>
                        <Link href={route('legal')} className="font-semibold text-slate-700 hover:text-sky-700">
                            Privacy Policy
                        </Link>
                        <Link href={route('legal')} className="font-semibold text-slate-700 hover:text-sky-700">
                            Data Deletion Policy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}