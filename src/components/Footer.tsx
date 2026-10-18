import Link from 'next/link';

function Footer() {
    return (
        <footer className="bg-zinc-100 dark:bg-[#09090b] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-900 mt-auto transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand Info */}
                    <div className="sm:col-span-2 space-y-3">
                        <Link href="/" className="flex items-center gap-2 inline-flex">
                            <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-rose-600/30">
                                S
                            </div>
                            <span className="font-black text-xl tracking-wider text-zinc-900 dark:text-white">
                                SARUI<span className="text-rose-500">MOV</span>
                            </span>
                        </Link>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
                            Platform streaming film dan serial TV dengan tampilan sinematik modern, responsif, dan dukungan multi-server streaming berkualitas tinggi.
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-md">
                            Disclaimer: SaruiMov does not host any media files on its servers. All media is provided by non-affiliated third party providers.
                        </p>
                    </div>

                    {/* Movie Categories */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-300 mb-3">
                            Film &amp; Movies
                        </h4>
                        <div className="flex flex-col space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Link href="/trending" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trending Movies</Link>
                            <Link href="/popular" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Popular Movies</Link>
                            <Link href="/top_rated" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Top Rated Movies</Link>
                            <Link href="/now_playing" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Now Playing</Link>
                            <Link href="/upcoming" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Upcoming</Link>
                        </div>
                    </div>

                    {/* TV & Anime Categories */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-300 mb-3">
                            Series &amp; Anime
                        </h4>
                        <div className="flex flex-col space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <Link href="/trending/tv" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trending Series</Link>
                            <Link href="/popular/tv" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Popular Series</Link>
                            <Link href="/top_rated/tv" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Top Rated Series</Link>
                            <Link href="/airing_today" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Airing Today</Link>
                            <Link href="/anime" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Anime Series</Link>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <p>© {new Date().getFullYear()} SaruiMov. All rights reserved.</p>
                    <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                        <Link href="/trending" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Beranda</Link>
                        <span>•</span>
                        <a href="https://subsource.net" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Subtitles</a>
                        <span>•</span>
                        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">TMDB</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;