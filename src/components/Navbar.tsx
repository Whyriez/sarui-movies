'use client'
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import ThemeToggle from "./ui/ThemeToggle";
import { useSearchParams } from 'next/navigation';

interface NavbarProps {
    onSearch: (query: string) => void;
}

function NavbarContent() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPath, setCurrentPath] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        const query = searchParams.get('query');
        if (query) {
            setSearchQuery(query);
        }
        setCurrentPath(window.location.pathname);

        
    }, [searchParams]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (searchQuery) {
                window.location.href = `/search?page=1&query=${encodeURIComponent(searchQuery)}`;
            }
        }
    };
    return (
        <div >
            <div className="navbar fixed top-0 z-50 bg-base-100">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[60] mt-3 w-52 p-2 shadow">
                            <li><Link href={'/'}>All</Link></li>
                            <li>
                                <h1>Movies</h1>
                                <ul className="p-2">
                                    <li><Link href={'/now_playing'}><p>Now Playing</p> </Link></li>
                                    <li><Link href={'/popular'}>Popular</Link></li>
                                    <li><Link href={'/top_rated'}>Top Rated</Link></li>
                                    <li><Link href={'/upcoming'}>Upcoming</Link></li>
                                </ul>
                            </li>
                            <li>
                                <h1>TV Series</h1>
                                <ul className="p-2">
                                    <li><Link href={'/airing_today'}><p>Airing Today</p> </Link></li>
                                    <li><Link href={'/on_the_air'}>On The Air</Link></li>
                                    <li><Link href={'/popular/tv'}>Popular</Link></li>
                                    {/* <li><Link href={'/top_rated/tv'}>Top Rated</Link></li> */}
                                </ul>
                            </li>
                            <li><Link href={'/anime'}>Anime</Link></li>
                        </ul>
                    </div>
                    <Link href={'/'} className="btn text-xl">
                        <span className="hidden sm:inline">SaruiMovie</span>
                        <span className="inline sm:hidden">SM</span>
                    </Link>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1 z-50">
                        <li><Link href={'/'}>All</Link></li>
                        <li>
                            <details>
                                <summary>Movies</summary>
                                <ul className="p-2 z-10">
                                    <li><Link href={'/now_playing'}><p>Now Playing</p></Link></li>
                                    <li><Link href={'/popular'}>Popular</Link></li>
                                    <li><Link href={'/top_rated'}>Top Rated</Link></li>
                                    <li><Link href={'/upcoming'}>Upcoming</Link></li>
                                </ul>
                            </details>
                        </li>
                        <li>
                            <details>
                                <summary>TV Series</summary>
                                <ul className="p-2 z-10">
                                    <li><Link href={'/airing_today'}><p>Airing Today</p> </Link></li>
                                    <li><Link href={'/on_the_air'}>On The Air</Link></li>
                                    <li><Link href={'/popular/tv'}>Popular</Link></li>
                                    {/* <li><Link href={'/top_rated/tv'}>Top Rated</Link></li> */}
                                </ul>
                            </details>
                        </li>
                        <li><Link href={'/anime'}>Anime</Link></li>
                    </ul>
                </div>



                <div className="navbar-end gap-2">
                    <ThemeToggle />
                    <input
                        type="text"
                        placeholder="Search"
                        className="input input-bordered w-40 md:w-auto"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />

                </div>

            </div>
        </div>
    )
}

function Navbar() {
    return (
        <div>
            <Suspense fallback={<div className="navbar fixed top-0 z-50 bg-base-100">Loading...</div>}>
                <NavbarContent />
            </Suspense>
        </div>
    );
}

export default Navbar;