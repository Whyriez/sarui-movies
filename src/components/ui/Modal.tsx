'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Captions, Check, ChevronDown, RefreshCw, Shield, X } from 'lucide-react';

export interface ModalProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  contentType: 'play' | 'trailer' | 'series' | null;
  title: string;
  tmdbId: string;
  trailerKey?: string | null;
  season?: string;
  episode?: number;
}

type StreamContext = {
  isSeries: boolean;
  tmdbId: string;
  season?: string;
  episode?: number;
  formattedTitle: string;
  rawTitle: string;
  subtitleUrl: string | null;
};

type ServerOption = {
  id: string;
  label: string;
  disabled?: boolean;
  supportsSubtitle?: boolean;
  // Only enable iframe sandbox for providers verified to function with it.
  supportsSandbox?: boolean;
  referrerPolicy: 'no-referrer' | 'strict-origin-when-cross-origin';
  getUrl: (ctx: StreamContext) => string;
};

const trimSlash = (value: string) => value.replace(/\/+$/, '');
const seriesPath = (ctx: StreamContext, movie: string, tv: string) =>
  ctx.isSeries && ctx.season && ctx.episode != null ? tv : movie;

const SERVERS: ServerOption[] = [
  {
    id: 'server1',
    label: 'Server 1',
    referrerPolicy: 'strict-origin-when-cross-origin',
    getUrl: ({ isSeries, tmdbId, season, episode, rawTitle }) => {
      const base = trimSlash(
        process.env.NEXT_PUBLIC_STREAM_PROVIDER_URL ||
          'https://sarui-mov-provider.vercel.app',
      );
      const path = isSeries && season && episode != null
        ? `/embed/tv/${encodeURIComponent(tmdbId)}/${encodeURIComponent(season)}/${episode}`
        : `/embed/movie/${encodeURIComponent(tmdbId)}`;
      const params = new URLSearchParams({ autoplay: '1' });
      if (rawTitle) params.set('title', rawTitle);

      // Never put an API secret or NEXT_PUBLIC_* key in a browser iframe URL.
      // If the provider requires authentication, resolve a short-lived embed
      // URL or session server-side, and use that URL instead.
      return `${base}${path}?${params.toString()}`;
    },
  },
  {
    id: 'server2',
    label: 'Server 2',
    disabled: true,
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(
        process.env.NEXT_PUBLIC_EMBED_SERVER2 ||
          'https://media-streaming-ecru.vercel.app',
      );
      return seriesPath(
        ctx,
        `${base}/media/tmdb-movie-${ctx.tmdbId}-${ctx.formattedTitle}`,
        `${base}/media/tmdb-tv-${ctx.tmdbId}-${ctx.formattedTitle}`,
      );
    },
  },
  {
    id: 'server3',
    label: 'Server 3',
    supportsSandbox: true,
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(process.env.NEXT_PUBLIC_EMBED_SERVER1 || 'https://embedwave.cc');
      return seriesPath(
        ctx,
        `${base}/embed/movie/${ctx.tmdbId}`,
        `${base}/embed/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
      );
    },
  },
  {
    id: 'server4',
    label: 'Server 4',
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(
        process.env.NEXT_PUBLIC_EMBED_SERVER3 || 'https://watch.embed-api.stream',
      );
      return seriesPath(
        ctx,
        `${base}/embed/movie/${ctx.tmdbId}`,
        `${base}/embed/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
      );
    },
  },
  {
    id: 'server5',
    label: 'Server 5',
    supportsSubtitle: true,
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(process.env.NEXT_PUBLIC_EMBED_SERVER4 || 'https://vidlink.pro');
      const path = seriesPath(
        ctx,
        `${base}/movie/${ctx.tmdbId}`,
        `${base}/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
      );
      const query = new URLSearchParams();
      if (ctx.isSeries) query.set('nextbutton', 'true');
      if (ctx.subtitleUrl) {
        query.set('sub_file', ctx.subtitleUrl);
        query.set('sub_label', 'Custom Subtitle');
      }
      return query.size ? `${path}?${query.toString()}` : path;
    },
  },
  {
    id: 'server6',
    label: 'Server 6',
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(process.env.NEXT_PUBLIC_EMBED_SERVER5 || 'https://multiembed.mov');
      const query = new URLSearchParams({ video_id: ctx.tmdbId, tmdb: '1' });
      if (ctx.isSeries && ctx.season && ctx.episode != null) {
        query.set('s', ctx.season);
        query.set('e', String(ctx.episode));
      }
      return `${base}/?${query.toString()}`;
    },
  },
  {
    id: 'server7',
    label: 'Server 7',
    referrerPolicy: 'no-referrer',
    getUrl: (ctx) => {
      const base = trimSlash(process.env.NEXT_PUBLIC_EMBED_SERVER6 || 'https://vidsrc.sh/embed');
      return seriesPath(
        ctx,
        `${base}/movie/${ctx.tmdbId}`,
        `${base}/tv/${ctx.tmdbId}/${ctx.season}/${ctx.episode}`,
      );
    },
  },
];

const formatTitle = (title: string) =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const controlButton =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-30';

const Modal: React.FC<ModalProps> = ({
  id = 'modal',
  isOpen = true,
  onClose,
  contentType,
  title,
  tmdbId,
  trailerKey,
  season,
  episode,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedServer, setSelectedServer] = useState('server1');
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFrameError, setHasFrameError] = useState(false);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
  const [subtitleFileName, setSubtitleFileName] = useState('');
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [isUploadingSub, setIsUploadingSub] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [restrictPopups, setRestrictPopups] = useState(true);

  const isTrailer = contentType === 'trailer';
  const isSeries = contentType === 'series';
  const activeServer = useMemo(
    () => SERVERS.find((server) => server.id === selectedServer && !server.disabled) || SERVERS[0],
    [selectedServer],
  );

  const streamContext = useMemo<StreamContext>(
    () => ({
      isSeries,
      tmdbId,
      season,
      episode,
      formattedTitle: formatTitle(title),
      rawTitle: title,
      subtitleUrl,
    }),
    [isSeries, tmdbId, season, episode, title, subtitleUrl],
  );

  const embedUrl = useMemo(() => {
    if (!contentType) return null;
    if (isTrailer) {
      if (!trailerKey) return null;
      const youtubeBase = trimSlash(process.env.NEXT_PUBLIC_YOUTUBE || 'https://www.youtube.com');
      return `${youtubeBase}/embed/${encodeURIComponent(trailerKey)}?autoplay=1&rel=0`;
    }
    return activeServer.getUrl(streamContext);
  }, [contentType, isTrailer, trailerKey, activeServer, streamContext]);

  const sandbox = !isTrailer && restrictPopups && activeServer.supportsSandbox
    ? 'allow-scripts allow-same-origin allow-forms allow-presentation'
    : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    setSelectedServer('server1');
    setSubtitleUrl(null);
    setSubtitleFileName('');
    setShowSubPanel(false);
    setUploadError('');
  }, [tmdbId, season, episode, contentType]);

  useEffect(() => {
    if (!isOpen || !embedUrl) return;
    setIsLoading(true);
    setHasFrameError(false);
  }, [isOpen, embedUrl, reloadKey]);

  const requestClose = () => {
    if (onClose) onClose();
    else dialogRef.current?.close();
  };

  const reloadPlayer = () => {
    setHasFrameError(false);
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  };

  const uploadSubtitle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError('');
    if (!/\.(srt|vtt)$/i.test(file.name)) {
      setUploadError('Gunakan file subtitle .srt atau .vtt.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran subtitle maksimal 2 MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsUploadingSub(true);

    try {
      const response = await fetch('/api/upload-subtitle', {
        method: 'POST',
        body: formData,
      });
      const data: { url?: unknown; error?: string } = await response.json();
      if (!response.ok || typeof data.url !== 'string' || !data.url) {
        throw new Error(data.error || 'File tidak dapat diunggah.');
      }
      setSubtitleUrl(data.url);
      setSubtitleFileName(file.name);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload subtitle gagal.');
    } finally {
      setIsUploadingSub(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) requestClose();
      }}
      className="fixed inset-0 m-auto h-[100dvh] max-h-[100dvh] w-screen max-w-none overflow-hidden border-0 bg-[#101010] p-0 text-white shadow-2xl outline-none backdrop:bg-black/85 backdrop:backdrop-blur-[3px] open:flex open:flex-col sm:h-auto sm:max-h-[94dvh] sm:w-[calc(100vw-48px)] sm:max-w-[1240px] sm:rounded-xl sm:border sm:border-white/[0.10]"
    >
      {/* Header: title, quiet metadata, and close. */}
      <header className="flex min-h-[72px] shrink-0 items-center justify-between gap-4 px-5 sm:px-7">
        <div className="min-w-0">
          <h2
            id={`${id}-title`}
            className="truncate text-[17px] font-medium tracking-[-0.025em] text-white/95 sm:text-[19px]"
          >
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] text-white/40">
            {isTrailer
              ? 'Trailer'
              : isSeries && season && episode != null
                ? `Season ${season} · Episode ${episode}`
                : 'Sedang menonton'}
          </p>
        </div>
        <button className={controlButton} type="button" onClick={requestClose} aria-label="Tutup pemutar">
          <X size={20} strokeWidth={1.7} />
        </button>
      </header>

      {/* The film should take the largest share of visual attention. */}
      <section className="relative flex min-h-0 flex-1 items-center justify-center bg-black sm:flex-none">
        <div className="relative aspect-video w-full max-h-[calc(100dvh-176px)] overflow-hidden bg-black sm:max-h-[min(72dvh,760px)]">
          {isOpen && embedUrl && (
            <iframe
              key={`${embedUrl}-${reloadKey}-${sandbox || 'compatible'}`}
              src={embedUrl}
              title={`${title} — ${isTrailer ? 'trailer' : 'video'}`}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
              allowFullScreen
              sandbox={sandbox}
              referrerPolicy={
                isTrailer ? 'strict-origin-when-cross-origin' : activeServer.referrerPolicy
              }
              onLoad={() => {
                setIsLoading(false);
                setHasFrameError(false);
              }}
              onError={() => {
                setIsLoading(false);
                setHasFrameError(true);
              }}
            />
          )}

          {isOpen && embedUrl && isLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#070707]" role="status" aria-label="Memuat video">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-white/75" />
            </div>
          )}

          {(!embedUrl || hasFrameError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[15px] font-medium text-white/85">
                {isTrailer ? 'Trailer tidak tersedia' : 'Video tidak dapat ditampilkan'}
              </p>
              <p className="max-w-xs text-[13px] leading-6 text-white/45">
                {isTrailer ? 'Trailer belum tersedia untuk judul ini.' : 'Coba muat ulang atau pilih server lain.'}
              </p>
              {embedUrl && (
                <button
                  type="button"
                  onClick={reloadPlayer}
                  className="mt-2 border-b border-white/40 pb-1 text-[13px] text-white/85 hover:border-white"
                >
                  Coba lagi
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {!isTrailer && (
        <footer className="shrink-0 border-t border-white/[0.08] bg-[#101010]">
          <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <label
                htmlFor={`${id}-server`}
                className="shrink-0 text-[12px] text-white/45"
              >
                Server
              </label>
              <div className="relative">
                <select
                  id={`${id}-server`}
                  value={activeServer.id}
                  onChange={(event) => {
                    setSelectedServer(event.target.value);
                    setShowSubPanel(false);
                  }}
                  className="h-10 min-w-[148px] appearance-none rounded-md border border-white/[0.12] bg-[#1b1b1b] py-2 pl-3 pr-9 text-[13px] font-medium text-white/90 outline-none transition-colors hover:border-white/25 focus-visible:border-white/50"
                >
                  {SERVERS.map((server) => (
                    <option key={server.id} value={server.id} disabled={server.disabled}>
                      {server.label}{server.disabled ? ' (Tidak tersedia)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45"
                  size={14}
                  strokeWidth={1.6}
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activeServer.supportsSubtitle && (
                <button
                  type="button"
                  onClick={() => setShowSubPanel((value) => !value)}
                  aria-expanded={showSubPanel}
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-[12px] transition-colors hover:bg-white/[0.07] ${
                    showSubPanel || subtitleUrl ? 'text-white' : 'text-white/55'
                  }`}
                >
                  <Captions size={17} strokeWidth={1.6} />
                  Subtitle
                  {subtitleUrl && <Check size={13} strokeWidth={2} aria-label="Aktif" />}
                </button>
              )}
              {activeServer.supportsSandbox && (
                <button
                  type="button"
                  aria-pressed={restrictPopups}
                  onClick={() => setRestrictPopups((value) => !value)}
                  title="Batasi pop-up dari pemutar ini (mode kompatibilitas dapat diperlukan)"
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-[12px] transition-colors hover:bg-white/[0.07] ${
                    restrictPopups ? 'text-white' : 'text-white/45'
                  }`}
                >
                  <Shield size={16} strokeWidth={1.7} />
                  <span className="hidden sm:inline">Batasi pop-up</span>
                  <span className="sm:hidden">Proteksi</span>
                  <span className="text-white/40">{restrictPopups ? 'On' : 'Off'}</span>
                </button>
              )}
              <button
                type="button"
                className={controlButton}
                title="Muat ulang video"
                aria-label="Muat ulang video"
                onClick={reloadPlayer}
              >
                <RefreshCw size={17} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          {activeServer.supportsSubtitle && showSubPanel && (
            <div className="border-t border-white/[0.08] px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white/90">Subtitle tambahan</p>
                  <p className="mt-1 truncate text-[12px] text-white/40">
                    {subtitleFileName || 'Pilih file .srt atau .vtt untuk video ini.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".srt,.vtt"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={uploadSubtitle}
                  />
                  {subtitleUrl && (
                    <button
                      type="button"
                      className="text-[12px] text-white/45 underline underline-offset-4 hover:text-white"
                      onClick={() => {
                        setSubtitleUrl(null);
                        setSubtitleFileName('');
                        setUploadError('');
                      }}
                    >
                      Hapus
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isUploadingSub}
                    className="inline-flex h-9 min-w-[110px] items-center justify-center rounded-md border border-white/20 bg-white/[0.09] px-4 text-[12px] font-medium text-white transition-colors hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingSub ? 'Mengunggah…' : subtitleUrl ? 'Ganti file' : 'Pilih file'}
                  </button>
                </div>
              </div>
              {uploadError && <p role="alert" className="mt-3 text-[12px] text-rose-300">{uploadError}</p>}
            </div>
          )}
        </footer>
      )}
    </dialog>
  );
};

export default Modal;
