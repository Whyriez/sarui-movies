'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Poster from './Poster';
import Modal from './Modal';
import {
  getWatchHistory,
  removeWatchHistoryItem,
  clearWatchHistory,
  WATCH_HISTORY_EVENT,
  formatProgressTime,
  formatRelativeTime,
  type WatchHistoryItem,
} from '@/lib/watchHistory';
import { Clock, Play, Search, Trash2, X } from 'lucide-react';

interface WatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WatchHistoryModal: React.FC<WatchHistoryModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [activePlayItem, setActivePlayItem] = useState<WatchHistoryItem | null>(null);

  useEffect(() => {
    setMounted(true);
    const refresh = () => setItems(getWatchHistory());
    refresh();
    window.addEventListener(WATCH_HISTORY_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WATCH_HISTORY_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const filtered = items.filter((item) => {
    const matchesSearch =
      !search.trim() || item.title.toLowerCase().includes(search.trim().toLowerCase());
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === 'movie'
        ? item.mediaType === 'movie'
        : item.mediaType === 'tv' || item.mediaType === 'anime';
    return matchesSearch && matchesType;
  });

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      clearWatchHistory();
    }
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="watch-history-title"
      className="relative mx-auto w-full max-w-[640px] overflow-hidden rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl dark:border-zinc-800 dark:bg-[#121215] dark:text-zinc-100 flex flex-col"
      style={{ maxHeight: 'calc(100dvh - 3rem)' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20">
            <Clock size={16} strokeWidth={2} />
          </span>
          <div>
            <h2 id="watch-history-title" className="text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
              Watch History
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {items.length} {items.length === 1 ? 'title' : 'titles'} saved in your browser
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear all history"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Controls: Search & Filter Tabs */}
      <div className="border-b border-zinc-200 bg-zinc-50/70 p-3 sm:px-5 dark:border-zinc-800/80 dark:bg-zinc-900/40 shrink-0 space-y-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-rose-500 dark:border-zinc-800 dark:bg-[#18181b] dark:text-white dark:placeholder:text-zinc-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('movie')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filterType === 'movie'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Movies ({items.filter((i) => i.mediaType === 'movie').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('tv')}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              filterType === 'tv'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            Series ({items.filter((i) => i.mediaType === 'tv' || i.mediaType === 'anime').length})
          </button>
        </div>
      </div>

      {/* Item List */}
      <div className="overflow-y-auto p-3 sm:p-5 flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500 mb-3">
              <Clock size={20} strokeWidth={1.8} />
            </span>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {items.length === 0 ? 'No watch history yet' : 'No matching titles'}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
              {items.length === 0
                ? 'Movies and episodes you play will automatically appear here with your saved progress.'
                : 'Try adjusting your search or filter options.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const isSeries = item.mediaType === 'tv' || item.mediaType === 'anime';
            const detailHref = isSeries
              ? item.season
                ? `/detail/tv/season/${item.tmdbId}/${item.season}`
                : `/detail/tv/${item.tmdbId}`
              : `/detail/${item.tmdbId}`;

            const percent =
              item.progressSeconds && item.durationSeconds && item.durationSeconds > 0
                ? Math.min(100, Math.round((item.progressSeconds / item.durationSeconds) * 100))
                : null;

            return (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 py-3 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 rounded-xl px-2 transition-colors"
              >
                {/* Poster & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative size-14 sm:w-12 sm:h-16 shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <Poster
                      path={item.posterPath || item.backdropPath}
                      alt={item.title}
                      width={100}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="shrink-0 rounded-md bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                        {isSeries && item.season && item.episode != null
                          ? `S${item.season} • Ep. ${item.episode}`
                          : isSeries
                          ? 'Series'
                          : 'Movie'}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {formatRelativeTime(item.lastWatchedAt)}
                      </span>
                    </div>

                    <Link
                      href={detailHref}
                      onClick={onClose}
                      className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 truncate block transition-colors"
                    >
                      {item.title}
                    </Link>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>
                        {item.progressSeconds && item.progressSeconds > 0
                          ? `Progress: ${formatProgressTime(item.progressSeconds)}`
                          : isSeries && item.episode != null
                          ? `Episode ${item.episode}`
                          : 'Started'}
                      </span>
                      {percent !== null && (
                        <span className="text-zinc-400 dark:text-zinc-500 font-mono">
                          ({percent}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePlayItem(item)}
                    className="flex size-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-sm cursor-pointer"
                    title="Resume watching"
                    aria-label={`Resume watching ${item.title}`}
                  >
                    <Play size={13} className="fill-current ml-0.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeWatchHistoryItem(item.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Remove from history"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Active Modal Player */}
      {activePlayItem && (
        <Modal
          id="history-player-modal"
          isOpen={true}
          onClose={() => setActivePlayItem(null)}
          contentType={activePlayItem.mediaType === 'movie' ? 'play' : 'series'}
          title={activePlayItem.title}
          tmdbId={activePlayItem.tmdbId}
          season={activePlayItem.season}
          episode={activePlayItem.episode}
          posterPath={activePlayItem.posterPath}
          backdropPath={activePlayItem.backdropPath}
        />
      )}
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm dark:bg-black/80 dark:backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {content}
    </div>,
    document.body
  );
};

