export interface WatchHistoryItem {
  id: string; // e.g. "movie-533535" or "tv-66732"
  tmdbId: string;
  mediaType: 'movie' | 'tv' | 'anime';
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  season?: string;
  episode?: number;
  episodeTitle?: string;
  progressSeconds?: number;
  durationSeconds?: number;
  lastWatchedAt: number; // Unix timestamp in ms
}

const STORAGE_KEY = 'sarui_watch_history';
export const WATCH_HISTORY_EVENT = 'sarui_watch_history_changed';
const MAX_HISTORY_ITEMS = 40;

/**
 * Retrieve the full watch history list from localStorage.
 */
export function getWatchHistory(): WatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item && typeof item.tmdbId === 'string' && typeof item.title === 'string'
    );
  } catch {
    return [];
  }
}

/**
 * Get a single watch item by tmdbId and optional mediaType.
 */
export function getWatchItem(
  tmdbId: string | number,
  mediaType?: 'movie' | 'tv' | 'anime'
): WatchHistoryItem | null {
  const history = getWatchHistory();
  const idStr = String(tmdbId);
  return (
    history.find(
      (item) => item.tmdbId === idStr && (!mediaType || item.mediaType === mediaType)
    ) || null
  );
}

/**
 * Check if a specific episode of a series was watched.
 */
export function isEpisodeWatched(
  tmdbId: string | number,
  season: string | number,
  episode: number
): boolean {
  const item = getWatchItem(tmdbId);
  if (!item) return false;
  // If user is currently on a higher episode or on this exact episode
  if (item.season === String(season)) {
    return item.episode != null && item.episode >= episode;
  }
  return false;
}

/**
 * Save or update an item's progress in watch history.
 */
export function saveWatchProgress(
  data: Omit<WatchHistoryItem, 'id' | 'lastWatchedAt'> & {
    id?: string;
    lastWatchedAt?: number;
  }
): WatchHistoryItem {
  if (typeof window === 'undefined') {
    return {
      ...data,
      id: data.id || `${data.mediaType}-${data.tmdbId}`,
      lastWatchedAt: data.lastWatchedAt || Date.now(),
    };
  }

  const history = getWatchHistory();
  const id = data.id || `${data.mediaType}-${data.tmdbId}`;
  const now = data.lastWatchedAt || Date.now();

  const existingIndex = history.findIndex(
    (item) => item.id === id || (item.tmdbId === String(data.tmdbId) && item.mediaType === data.mediaType)
  );

  const existing = existingIndex >= 0 ? history[existingIndex] : null;

  const updatedItem: WatchHistoryItem = {
    id,
    tmdbId: String(data.tmdbId),
    mediaType: data.mediaType,
    title: data.title || existing?.title || 'Unknown Title',
    posterPath: data.posterPath !== undefined ? data.posterPath : existing?.posterPath,
    backdropPath: data.backdropPath !== undefined ? data.backdropPath : existing?.backdropPath,
    season: data.season !== undefined ? String(data.season) : existing?.season,
    episode: data.episode !== undefined ? Number(data.episode) : existing?.episode,
    episodeTitle: data.episodeTitle || existing?.episodeTitle,
    progressSeconds:
      data.progressSeconds !== undefined
        ? Math.max(0, Math.floor(data.progressSeconds))
        : existing?.progressSeconds,
    durationSeconds:
      data.durationSeconds !== undefined
        ? Math.max(0, Math.floor(data.durationSeconds))
        : existing?.durationSeconds,
    lastWatchedAt: now,
  };

  // Remove existing entry if present, then unshift updated entry to top
  const filtered = history.filter(
    (item) => item.id !== id && !(item.tmdbId === String(data.tmdbId) && item.mediaType === data.mediaType)
  );
  filtered.unshift(updatedItem);

  // Keep within max limit
  const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent(WATCH_HISTORY_EVENT, { detail: updatedItem }));
  } catch (err) {
    console.error('Failed to save watch history to localStorage:', err);
  }

  return updatedItem;
}

/**
 * Remove a specific item from watch history by id or tmdbId.
 */
export function removeWatchHistoryItem(idOrTmdbId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getWatchHistory();
    const updated = history.filter(
      (item) => item.id !== idOrTmdbId && item.tmdbId !== idOrTmdbId
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(WATCH_HISTORY_EVENT, { detail: { removedId: idOrTmdbId } }));
  } catch (err) {
    console.error('Failed to remove item from watch history:', err);
  }
}

/**
 * Clear all watch history.
 */
export function clearWatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(WATCH_HISTORY_EVENT, { detail: { cleared: true } }));
  } catch (err) {
    console.error('Failed to clear watch history:', err);
  }
}

/**
 * Format playback progress seconds into a readable string (e.g. "14:20" or "1h 24m").
 */
export function formatProgressTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Format relative time (e.g. "Just now", "25m ago", "2h ago", "Yesterday").
 */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

