import { Head, Link } from '@inertiajs/react';
import PublicShell from '@/Components/PublicShell';

const company = {
    name: 'WebissoLLC',
    phone: '+1 209 208 0078',
    email: 'hello@webisso.com',
    address: '30 N Gould St. Sheridan, WY 82801',
};

const sections = [
    {
        title: 'Terms of Service',
        body: [
            `MultiShare is operated by ${company.name}. The service provides public sharing pages for text, images, video, audio, and general files. By using the service, you confirm that you have authority to publish the submitted content and that your use complies with applicable law.`,
            'You must not upload malware, illegal content, deceptive material, spam, copyrighted material without permission, or content that violates privacy, confidentiality, intellectual property rights, or contractual obligations.',
            `The service is provided on an open-source basis without warranties of uninterrupted availability, fitness for a particular purpose, or permanent retention of uploaded data. Questions about these terms may be sent to ${company.email} or raised by phone at ${company.phone}.`,
        ],
    },
    {
        title: 'Privacy Policy',
        body: [
            'Text shares are stored in the application database. File-based shares are stored on the configured object storage provider, such as DigitalOcean Spaces, in order to deliver public URLs and previews.',
            'Operational metadata may include file names, MIME types, file size, timestamps, storage paths, and public identifiers required to render share pages and schedule cleanup.',
            `You should not use MultiShare for sensitive personal data, regulated data, secrets, credentials, or confidential client information unless you have independently added suitable protections. Privacy-related questions may be directed to ${company.email}.`,
        ],
    },
    {
        title: 'Data Retention and Deletion',
        body: [
            'All share types can be assigned their own retention period through application configuration. Cleanup is performed by a scheduled Laravel job and depends on the application scheduler and queue worker running correctly.',
            'Text shares are stored in MySQL and file-based shares are stored on the configured object storage provider, but both follow the same expiration-driven cleanup flow.',
            `Deletion requests, takedown notices, and data concerns for the live service should be sent to ${company.email}. Postal correspondence may be addressed to ${company.address}.`,
        ],
    },
    {
        title: 'Acceptable Use and Abuse Handling',
        body: [
            'You may suspend, delete, or block any share that appears abusive, unlawful, malicious, infringing, or likely to expose you to operational, reputational, or legal risk.',
            `Abuse reports, copyright complaints, impersonation claims, privacy complaints, and security concerns should be reported to ${company.email} or ${company.phone}.`,
            `For the current live deployment, operator contact details are: ${company.name}, ${company.address}, ${company.email}, ${company.phone}.`,
        ],
    },
];

export default function Legal() {
    return (
        <>
            <Head title="Terms and Policies" />

            <PublicShell>
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-10">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-700">
                                    Legal and trust center
                                </p>
                                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">
                                    Terms, privacy, and retention policies for MultiShare.
                                </h1>
                                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                                    This page applies to the live public deployment operated by WebissoLLC and includes operator identity, support contact details, and deletion request channels.
                                </p>
                            </div>

                            <Link
                                href={route('shares.index')}
                                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-800"
                            >
                                Back to MultiShare
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-4 rounded-[2rem] border border-sky-100 bg-sky-50 p-5 text-sm leading-6 text-slate-700 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Operator</p>
                                <p className="mt-2 font-semibold text-slate-950">{company.name}</p>
                                <p>{company.address}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Contact</p>
                                <p className="mt-2">
                                    Email: <a className="font-semibold text-slate-950" href={`mailto:${company.email}`}>{company.email}</a>
                                </p>
                                <p>
                                    Phone: <a className="font-semibold text-slate-950" href={`tel:${company.phone.replace(/\s+/g, '')}`}>{company.phone}</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6">
                        {sections.map((section) => (
                            <section
                                key={section.title}
                                className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur"
                            >
                                <h2 className="text-2xl font-black tracking-tight text-slate-950">{section.title}</h2>
                                <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
                                    {section.body.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </PublicShell>
        </>
    );
}