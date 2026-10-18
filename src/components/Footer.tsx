
import Link from 'next/link';

const footerLinks = [
    {
        title: 'Explore',
        links: [
            { label: 'Trending', href: '/trending' },
            { label: 'Popular', href: '/popular' },
            { label: 'Top Rated', href: '/top_rated' },
            { label: 'Now Playing', href: '/now_playing' },
            { label: 'Upcoming', href: '/upcoming' },
        ],
    },
    {
        title: 'TV & Series',
        links: [
            { label: 'Trending Series', href: '/trending/tv' },
            { label: 'Popular Series', href: '/popular/tv' },
            { label: 'Top Rated', href: '/top_rated/tv' },
            { label: 'Airing Today', href: '/airing_today' },
            { label: 'Anime', href: '/anime' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-zinc-200 bg-white text-zinc-900 transition-colors dark:border-white/[0.08] dark:bg-[#09090b] dark:text-white">
            <div className="mx-auto w-full max-w-7xl px-6 pt-14 pb-7 sm:px-8 sm:pt-20 lg:px-10">
                <div className="grid gap-14 pb-16 md:grid-cols-[minmax(0,1fr)_auto] md:gap-20 lg:pb-24">
                    {/* Brand */}
                    <div className="max-w-md">

                        <Link
                            href="/"
                            aria-label="SaruiMov Home"
                            className="inline-flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
                        >
                            <span className="text-[22px] sm:text-[24px] font-extrabold tracking-tight leading-none text-zinc-950 dark:text-white">
                                Sarui
                                <span className="text-[#e0464f]">Mov</span>
                            </span>
                        </Link>


                        <p className="mt-5 max-w-[310px] text-[14px] leading-[1.8] text-zinc-500 dark:text-zinc-400">
                            A space to discover, explore, and enjoy
                            movies and television.
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav
                        aria-label="Footer navigation"
                        className="grid grid-cols-2 gap-x-10 gap-y-10 sm:gap-x-20 lg:gap-x-28"
                    >
                        {footerLinks.map((group) => (
                            <div key={group.title}>
                                <h2 className="mb-6 text-[12px] font-medium tracking-[-0.01em] text-zinc-950 dark:text-zinc-100">
                                    {group.title}
                                </h2>

                                <ul className="space-y-3.5">
                                    {group.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="text-[13px] leading-6 text-zinc-500 transition-colors duration-200 hover:text-zinc-950 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500 dark:text-zinc-500 dark:hover:text-white"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Disclaimer */}
                <div className="border-t border-zinc-200 py-7 dark:border-white/[0.08]">
                    <p className="max-w-2xl text-[12px] leading-[1.85] text-zinc-500 dark:text-zinc-500">
                        SaruiMov does not host media files on its servers.
                        Content is provided through independent third-party
                        services that are not affiliated with SaruiMov.
                    </p>
                </div>

                {/* Bottom */}
                <div className="flex flex-col gap-5 border-t border-zinc-200 pt-7 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
                    <p className="text-[12px] text-zinc-500">
                        © {new Date().getFullYear()} SaruiMov.
                        All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <Link
                            href="/"
                            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-white"
                        >
                            Home
                        </Link>

                        <a
                            href="https://subsource.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-white"
                        >
                            Subtitles
                        </a>

                        <a
                            href="https://www.themoviedb.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-white"
                        >
                            TMDB
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
