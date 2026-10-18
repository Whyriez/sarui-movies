'use client'
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ThemeToggle from "./ui/ThemeToggle";
import { useRouter, useSearchParams } from 'next/navigation';

function NavbarContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        const query = searchParams.get('query');
        setSearchQuery(query ?? '');
    }, [searchParams]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (searchQuery.trim()) {
                router.push(`/search?page=1&query=${encodeURIComponent(searchQuery.trim())}`);
            }
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/60 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
                {/* Brand & Mobile Menu */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Mobile Hamburger Dropdown */}
                    <div className="dropdown lg:hidden">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" aria-label="Menu">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-2xl z-[60] mt-3 w-64 p-3 shadow-2xl space-y-1">
                            <li><Link href="/" className="font-semibold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400">Beranda</Link></li>
                            <li className="menu-title pt-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Movies</li>
                            <li><Link href="/trending" className="hover:text-zinc-900 dark:hover:text-white">Trending Movies</Link></li>
                            <li><Link href="/popular" className="hover:text-zinc-900 dark:hover:text-white">Popular Movies</Link></li>
                            <li><Link href="/now_playing" className="hover:text-zinc-900 dark:hover:text-white">Now Playing</Link></li>
                            <li><Link href="/top_rated" className="hover:text-zinc-900 dark:hover:text-white">Top Rated</Link></li>
                            <li><Link href="/upcoming" className="hover:text-zinc-900 dark:hover:text-white">Upcoming</Link></li>
                            
                            <li className="menu-title pt-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">TV Series</li>
                            <li><Link href="/trending/tv" className="hover:text-zinc-900 dark:hover:text-white">Trending Series</Link></li>
                            <li><Link href="/popular/tv" className="hover:text-zinc-900 dark:hover:text-white">Popular Series</Link></li>
                            <li><Link href="/top_rated/tv" className="hover:text-zinc-900 dark:hover:text-white">Top Rated Series</Link></li>
                            <li><Link href="/airing_today" className="hover:text-zinc-900 dark:hover:text-white">Airing Today</Link></li>
                            <li><Link href="/on_the_air" className="hover:text-zinc-900 dark:hover:text-white">On The Air</Link></li>
                            
                            <li className="menu-title pt-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Spesial</li>
                            <li><Link href="/anime" className="hover:text-zinc-900 dark:hover:text-white">Anime Series</Link></li>
                        </ul>
                    </div>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <span className="font-black text-lg sm:text-xl tracking-wider text-zinc-900 dark:text-white">
                            SARUI<span className="text-rose-500">MOV</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1 ml-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        <Link href="/" className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                            Beranda
                        </Link>
                        
                        {/* Movies Dropdown */}
                        <div className="dropdown dropdown-hover">
                            <div tabIndex={0} role="button" className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1 cursor-pointer">
                                <span>Film</span>
                                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-48 text-zinc-700 dark:text-zinc-300">
                                <li><Link href="/trending" className="hover:text-zinc-900 dark:hover:text-white">Trending</Link></li>
                                <li><Link href="/popular" className="hover:text-zinc-900 dark:hover:text-white">Popular</Link></li>
                                <li><Link href="/now_playing" className="hover:text-zinc-900 dark:hover:text-white">Now Playing</Link></li>
                                <li><Link href="/top_rated" className="hover:text-zinc-900 dark:hover:text-white">Top Rated</Link></li>
                                <li><Link href="/upcoming" className="hover:text-zinc-900 dark:hover:text-white">Upcoming</Link></li>
                            </ul>
                        </div>

                        {/* TV Series Dropdown */}
                        <div className="dropdown dropdown-hover">
                            <div tabIndex={0} role="button" className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-1 cursor-pointer">
                                <span>Serial TV</span>
                                <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-48 text-zinc-700 dark:text-zinc-300">
                                <li><Link href="/trending/tv" className="hover:text-zinc-900 dark:hover:text-white">Trending Series</Link></li>
                                <li><Link href="/popular/tv" className="hover:text-zinc-900 dark:hover:text-white">Popular Series</Link></li>
                                <li><Link href="/top_rated/tv" className="hover:text-zinc-900 dark:hover:text-white">Top Rated Series</Link></li>
                                <li><Link href="/airing_today" className="hover:text-zinc-900 dark:hover:text-white">Airing Today</Link></li>
                                <li><Link href="/on_the_air" className="hover:text-zinc-900 dark:hover:text-white">On The Air</Link></li>
                            </ul>
                        </div>

                        <Link href="/anime" className="px-3 py-1.5 rounded-lg hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                            Anime
                        </Link>
                    </div>
                </div>

                {/* Search Bar & Theme */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative flex items-center">
                        <svg className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari film, serial..."
                            className="w-36 xs:w-48 sm:w-60 md:w-72 bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 text-xs sm:text-sm rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}

function Navbar() {
    return (
        <Suspense fallback={<div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/60 z-50"></div>}>
            <NavbarContent />
        </Suspense>
    );
}

export default Navbar;
