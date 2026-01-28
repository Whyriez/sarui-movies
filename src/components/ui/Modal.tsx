'use client'
import { useEffect, useState } from 'react'
import * as cheerio from 'cheerio';
import { title } from 'process';

interface Modal {
    id: string;
    contentType: 'play' | 'trailer' | 'series';
    title: string;
    tmdbId: string;
    trailerKey?: string | null;
    season?: string;
    episode?: number;
}
const formatTitle = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
};

const Modal: React.FC<Modal> = ({ id, contentType, title, tmdbId, trailerKey, season, episode }) => {
    const isPlay = contentType === 'play';
    const isTrailer = contentType === 'trailer' && trailerKey;
    const isSeries = contentType === 'series';
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const formattedTitle = formatTitle(title);
    const [selectedServer, setSelectedServer] = useState("server1");

    const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);
    const [isUploadingSub, setIsUploadingSub] = useState(false);

    const checkEmbedAvailability = async (url: string, timeout: number = 3000) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setIsUploadingSub(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload-subtitle', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                setSubtitleUrl(data.url);
            } else {
                alert('Gagal upload subtitle: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan saat upload subtitle');
            setIsLoading(false);
        } finally {
            setIsUploadingSub(false);
        }
    };

    useEffect(() => {
        setSubtitleUrl(null);
    }, [tmdbId, season, episode]);

    useEffect(() => {
        const determineEmbedUrl = () => {
            setIsLoading(true);
            let url = '';

            // Hapus pengecekan fetch (CORS issue), langsung construct URL
            if (selectedServer === "server1") {
                if (isSeries && season && episode) {
                    url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE2}/media/tmdb-tv-${tmdbId}-${formattedTitle}`;
                } else if (isPlay) {
                    url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE2}/media/tmdb-movie-${tmdbId}-${formattedTitle}`;
                }
            } else if (selectedServer === "server2") {
                if (isSeries && season && episode) {
                    url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`;
                } else if (isPlay) {
                    url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/movie/${tmdbId}`;
                }
            } else if (selectedServer === "server3") {
                if (isSeries && season && episode) {
                    url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
                } else if (isPlay) {
                    url = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
                }
            } else if (selectedServer === "server4") {
                // --- LOGIKA SERVER 4 DENGAN SUBTITLE ---

                let baseUrl = '';
                if (isSeries && season && episode) {
                    baseUrl = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
                } else if (isPlay) {
                    baseUrl = `https://vidlink.pro/movie/${tmdbId}`;
                }

                // Gunakan URLSearchParams untuk menyusun query string dengan rapi
                const params = new URLSearchParams();

                // 1. Params Next Button (Sesuai request)
                if (isSeries) {
                    params.append('nextbutton', 'true');
                }

                // 2. Params Subtitle (JIKA ADA URL HASIL UPLOAD)
                if (subtitleUrl) {
                    params.append('sub_file', subtitleUrl);
                    params.append('sub_label', 'Indonesian / Custom'); // Label subtitle di player
                }

                // Gabungkan Base URL + Params
                // Cek apakah baseUrl sudah punya '?' (jarang terjadi di vidlink clean url, tapi buat jaga-jaga)
                const queryString = params.toString();
                url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
            }

            setEmbedUrl(url);
           setTimeout(() => {
                setIsLoading(false);
            }, 500); // Delay 0.5 detik cukup
        };

        determineEmbedUrl();
    }, [selectedServer, isSeries, isPlay, isTrailer, tmdbId, formattedTitle, season, episode, trailerKey, subtitleUrl]);

    // useEffect(() => {
    //     const fetchAndCleanHtml = async () => {
    //         if (isPlay) {
    //             const res = await fetch(`https://vidsrc.io/embed/movie/${tmdbId}`);
    //             const html = await res.text();

    //             const $ = cheerio.load(html);

    //             const iframeSrc = $('#player_iframe').attr('src');
    //             setIframeSrc(iframeSrc || null);

    //             const servers = $('.server')
    //                 .map((i, el) => {
    //                     const name = $(el).text().trim(); 
    //                     const hash = $(el).attr('data-hash');
    //                     return hash ? { name, hash } : null;
    //                 })
    //                 .get()
    //                 .filter((server): server is { name: string; hash: string } => server !== null);

    //             setServerData(servers);

    //         } else if (isTrailer) {
    //             setIframeSrc(`${process.env.NEXT_PUBLIC_YOUTUBE}/embed/${trailerKey}`);
    //         }
    //     };

    //     fetchAndCleanHtml();
    // }, [tmdbId, trailerKey, isPlay, isTrailer]);


    useEffect(() => {
        const modalElement = document.getElementById(id) as HTMLDialogElement | null;
        const handleClose = () => {
            if (modalElement) {
                const iframe = modalElement.querySelector('iframe') as HTMLIFrameElement;
                if (iframe) {
                    iframe.src = iframe.src;
                }
            }
        };

        if (modalElement) {
            modalElement.addEventListener('close', handleClose);
        }

        return () => {
            if (modalElement) {
                modalElement.removeEventListener('close', handleClose);
            }
        };
    }, [id]);

    return (
        <div>
            <dialog id={id} className="modal">
                <div className="modal-box  w-11/12 max-w-5xl" >
                    <div className="modal-action flex-col">
                        <div className="relative w-full h-0" style={{ paddingBottom: '56.25%' }}>
                            {isLoading ? (
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/10">
                                    <div className="loading loading-spinner loading-lg"></div>
                                </div>
                            ) : (
                                embedUrl && (
                                    <iframe
                                        key={embedUrl}

                                        src={embedUrl}
                                        title={`${contentType} Embed`}
                                        frameBorder="0"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                                    />
                                )
                            )}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <div className="flex flex-wrap justify-center gap-2">
                                {['server1', 'server2', 'server3', 'server4'].map((server) => (
                                    <button
                                        key={server}
                                        className={`btn btn-sm sm:btn-md ${selectedServer === server ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => setSelectedServer(server)}
                                    >
                                        {server.charAt(0).toUpperCase() + server.slice(1).replace('server', 'Server ')}
                                    </button>
                                ))}
                            </div>
                            {selectedServer === 'server4' && (
                                <div className="flex flex-col items-center p-3 bg-base-200 rounded-lg w-full max-w-md">
                                    <span className="text-sm font-semibold mb-2">
                                        Custom Subtitle (.srt / .vtt)
                                    </span>
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="file"
                                            accept=".srt,.vtt"
                                            onChange={handleFileUpload}
                                            className="file-input file-input-bordered file-input-sm w-full"
                                            disabled={isUploadingSub}
                                        />
                                        {isUploadingSub && <span className="loading loading-spinner loading-sm"></span>}
                                    </div>
                                    <p className="text-xs text-opacity-50 mt-1 text-center">
                                        Subtitle akan dikonversi otomatis dan berlaku 24 jam.
                                    </p>
                                    {subtitleUrl && (
                                        <div className="badge badge-success gap-2 mt-2">
                                            Subtitle Active
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                    </div>
                </div>
            </dialog>

        </div>
    )
}

export default Modal