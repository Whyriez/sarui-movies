'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Poster from './ui/Poster';
import Modal from './ui/Modal';
import {
  getWatchHistory,
  removeWatchHistoryItem,
  clearWatchHistory,
  WATCH_HISTORY_EVENT,
  formatProgressTime,
  formatRelativeTime,
  type WatchHistoryItem,
} from '@/lib/watchHistory';
import { Play, Trash2, X, Clock } from 'lucide-react';

export default function ContinueWatching() {
  const [items, setItems] = useState<WatchHistoryItem[]>([]);
  const [activePlayItem, setActivePlayItem] = useState<WatchHistoryItem | null>(null);
  const [mounted, setMounted] = useState(false);

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

  if (!mounted || items.length === 0) return null;

  const handlePlay = (item: WatchHistoryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePlayItem(item);
  };

  const handleRemove = (item: WatchHistoryItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWatchHistoryItem(item.id);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Clear all watch history?')) {
      clearWatchHistory();
    }
  };

  return (
    <>
      <section aria-label="Continue Watching" className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex items-end justify-between mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex size-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
                <Clock size={13} strokeWidth={2.2} />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Continue Watching
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pick up right where you left off
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            title="Clear all watch history"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Clear History</span>
          </button>
        </div>

        {/* Scrollable list of continue watching cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {items.map((item) => {
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
                className="group relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-lg"
              >
                {/* Poster Canvas */}
                <div className="relative w-full aspect-[2/3] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                  <Poster
                    path={item.posterPath || item.backdropPath}
                    alt={item.title}
                    width={400}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Remove Item Button */}
                  <button
                    type="button"
                    onClick={(e) => handleRemove(item, e)}
                    aria-label={`Remove ${item.title} from history`}
                    title="Remove from history"
                    className="absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/70 text-zinc-300 hover:text-white hover:bg-rose-600 backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-md"
                  >
                    <X size={13} strokeWidth={2.2} />
                  </button>

                  {/* Top Badge: Episode or Media Type */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
                    <span className="inline-flex items-center rounded-md bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-md">
                      {isSeries && item.season && item.episode != null
                        ? `S${item.season} • Ep. ${item.episode}`
                        : isSeries
                        ? 'Series'
                        : 'Movie'}
                    </span>
                  </div>

                  {/* Hover Play Button Overlay */}
                  <div
                    onClick={(e) => handlePlay(item, e)}
                    className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                  >
                    <div className="size-11 sm:size-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 group-hover:scale-110 transition-transform duration-300">
                      <Play size={18} className="fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Progress Bar & Time */}
                  <div className="absolute bottom-0 inset-x-0 z-10">
                    {percent !== null ? (
                      <div className="w-full bg-black/60 backdrop-blur-xs h-1">
                        <div
                          className="bg-rose-600 h-1 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    ) : item.progressSeconds && item.progressSeconds > 0 ? (
                      <div className="bg-black/75 backdrop-blur-xs px-2 py-0.5 text-[10px] text-zinc-300 font-mono flex items-center justify-between">
                        <span>{formatProgressTime(item.progressSeconds)}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Card Content & Details Link */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <Link
                    href={detailHref}
                    className="text-xs sm:text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 line-clamp-1 transition-colors"
                    title={item.title}
                  >
                    {item.title}
                  </Link>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span>
                      {item.progressSeconds && item.progressSeconds > 0
                        ? `At ${formatProgressTime(item.progressSeconds)}`
                        : isSeries && item.episode != null
                        ? `Episode ${item.episode}`
                        : 'Started'}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      {formatRelativeTime(item.lastWatchedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct Playback Modal */}
      {activePlayItem && (
        <Modal
          id="continue-modal"
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
    </>
  );
}

