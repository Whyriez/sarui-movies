'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Clock, KeyRound, Menu, Search, X } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import {
  isLicenseValid,
  getStoredLicense,
  getRemainingSeconds,
  formatDuration,
  type LicenseData,
} from '@/lib/license';
import { LicenseModal } from './ui/LicenseModal';
import { WatchHistoryModal } from './ui/WatchHistoryModal';

const movieLinks = [
  { label: 'Trending', href: '/trending' },
  { label: 'Popular', href: '/popular' },
  { label: 'Now Playing', href: '/now_playing' },
  { label: 'Top Rated', href: '/top_rated' },
  { label: 'Upcoming', href: '/upcoming' },
];
const seriesLinks = [
  { label: 'Trending Series', href: '/trending/tv' },
  { label: 'Popular Series', href: '/popular/tv' },
  { label: 'Top Rated Series', href: '/top_rated/tv' },
  { label: 'Airing Today', href: '/airing_today' },
  { label: 'On the Air', href: '/on_the_air' },
];

type MenuName = 'movies' | 'series' | null;

function Brand() {
  return (
    <Link
      href="/"
      aria-label="SaruiMov — Home"
      className="inline-flex shrink-0 items-center whitespace-nowrap transition-opacity duration-200 hover:opacity-80"
    >
      <span className="text-[21px] font-extrabold leading-none tracking-[-0.045em] text-zinc-950 dark:text-white sm:text-[24px]">
        Sarui<span className="text-[#e0464f]">Mov</span>
      </span>
    </Link>
  );
}

function NavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const headerRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenu, setOpenMenu] = useState<MenuName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSearchQuery(searchParams.get('query') ?? '');
  }, [searchParams]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    setHydrated(true);
    const refresh = () => {
      if (!isLicenseValid()) {
        setLicense(null);
        setRemainingSeconds(null);
        return;
      }
      const current = getStoredLicense();
      setLicense(current);
      setRemainingSeconds(current?.expiresAt ? getRemainingSeconds() : null);
    };
    refresh();
    const interval = window.setInterval(refresh, 2000);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
        setMobileSearchOpen(false);
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '');
      if (!typing && (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'))) {
        event.preventDefault();
        setMobileSearchOpen(true);
        window.requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setMobileSearchOpen(false);
    setMobileOpen(false);
    router.push(`/search?page=1&query=${encodeURIComponent(query)}`);
  };

  const toggleMenu = (name: Exclude<MenuName, null>) => {
    setOpenMenu((current) => (current === name ? null : name));
  };

  const linkClass = (active: boolean) =>
    `inline-flex h-9 items-center px-2 text-[13px] font-medium transition-colors ${
      active
        ? 'text-zinc-950 dark:text-white'
        : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
    }`;

  const renderDropdown = (name: Exclude<MenuName, null>, label: string, links: typeof movieLinks) => {
    const active = links.some((item) => pathname === item.href);
    return (
      <div className="relative" key={name}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={openMenu === name}
          onClick={() => toggleMenu(name)}
          className={`${linkClass(active)} gap-1.5`}
        >
          {label}
          <ChevronDown size={13} strokeWidth={1.7} className={`transition-transform ${openMenu === name ? 'rotate-180' : ''}`} />
        </button>
        {openMenu === name && (
          <div className="absolute left-0 top-full z-[60] mt-3 w-52 border border-zinc-200 bg-white p-1.5 shadow-[0_12px_42px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#151515] dark:shadow-[0_12px_42px_rgba(0,0,0,0.45)]" role="menu">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpenMenu(null)}
                className={`block px-3 py-2.5 text-[13px] transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06] ${pathname === item.href ? 'text-zinc-950 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/95 text-zinc-900 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#09090b]/95 dark:text-white">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center gap-5 px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            onClick={() => { setMobileOpen((v) => !v); setMobileSearchOpen(false); }}
            className="inline-flex h-10 w-9 shrink-0 items-center justify-center text-zinc-700 dark:text-zinc-200 lg:hidden"
          >
            {mobileOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
          </button>
          <Brand />
          <nav aria-label="Primary navigation" className="ml-5 hidden items-center gap-5 lg:flex">
            <Link href="/" className={linkClass(pathname === '/')}>Home</Link>
            {renderDropdown('movies', 'Movies', movieLinks)}
            {renderDropdown('series', 'TV Series', seriesLinks)}
            <Link href="/anime" className={linkClass(pathname === '/anime')}>Anime</Link>
          </nav>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <form onSubmit={submitSearch} role="search" className="relative hidden md:block">
              <Search size={16} strokeWidth={1.7} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search movies and TV series"
                placeholder="Search titles"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-9 w-44 border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/30 xl:w-56"
              />
            </form>
            <button
              type="button"
              aria-label="Open search"
              onClick={() => { setMobileSearchOpen((v) => !v); setMobileOpen(false); window.requestAnimationFrame(() => searchInputRef.current?.focus()); }}
              className="inline-flex h-9 w-9 items-center justify-center text-zinc-600 dark:text-zinc-300 md:hidden"
            >
              <Search size={19} strokeWidth={1.7} />
            </button>
            <ThemeToggle />
            {hydrated && (
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                aria-label="View watch history"
                title="Watch History"
                className="inline-flex h-9 items-center justify-center gap-1.5 border border-zinc-200 px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/30 dark:hover:text-white"
              >
                <Clock size={15} strokeWidth={1.6} />
                <span className="hidden sm:inline">History</span>
              </button>
            )}
            {hydrated && (
              <button
                type="button"
                onClick={() => setShowLicenseModal(true)}
                aria-label="Manage streaming license"
                title={
                  license?.type === 'master'
                    ? 'Owner access (Permanent)'
                    : license?.type === 'custom'
                    ? `${license.name || 'Custom License'}: ${remainingSeconds !== null ? formatDuration(remainingSeconds) : 'Active'}`
                    : license?.type === 'demo'
                    ? `Demo access: ${remainingSeconds !== null ? formatDuration(remainingSeconds) : 'Active'}`
                    : 'Activate access'
                }
                className="inline-flex h-9 min-w-9 items-center justify-center gap-2 border border-zinc-200 px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/30 dark:hover:text-white sm:px-3"
              >
                <KeyRound size={15} strokeWidth={1.6} />
                <span className="hidden sm:inline">
                  {license?.type === 'master'
                    ? 'Owner'
                    : license?.type === 'custom'
                    ? (remainingSeconds !== null ? `${license.name ? license.name.split(' ')[0] : 'Pass'} ${formatDuration(remainingSeconds)}` : license.name || 'Active')
                    : license?.type === 'demo'
                    ? (remainingSeconds !== null ? formatDuration(remainingSeconds) : 'Demo')
                    : 'Access'}
                </span>
              </button>
            )}
          </div>
        </div>
        {mobileSearchOpen && (
          <form onSubmit={submitSearch} role="search" className="border-t border-zinc-200 px-5 py-3 dark:border-white/10 md:hidden">
            <input
              ref={searchInputRef}
              autoFocus
              type="search"
              aria-label="Search movies and TV series"
              placeholder="Search movies and series…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-[#171719] dark:focus:border-white/30"
            />
          </form>
        )}
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="max-h-[calc(100dvh-68px)] overflow-y-auto border-t border-zinc-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-[#09090b] lg:hidden">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium">Home</Link>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); setShowHistoryModal(true); }}
              className="flex w-full items-center gap-2 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              <Clock size={16} />
              <span>Watch History</span>
            </button>
            <div className="mt-5 grid grid-cols-2 gap-6">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Movies</p>
                {movieLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block py-2 text-[13px] text-zinc-600 dark:text-zinc-300">{item.label}</Link>)}
              </div>
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">TV Series</p>
                {seriesLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="block py-2 text-[13px] text-zinc-600 dark:text-zinc-300">{item.label}</Link>)}
                <Link href="/anime" onClick={() => setMobileOpen(false)} className="mt-3 block py-2 text-[13px] font-medium">Anime</Link>
              </div>
            </div>
          </nav>
        )}
      </header>
      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onSuccess={(newLicense) => { setLicense(newLicense); setShowLicenseModal(false); }}
      />
      <WatchHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="fixed inset-x-0 top-0 z-50 h-[68px] border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#09090b]" />}>
      <NavbarContent />
    </Suspense>
  );
}
