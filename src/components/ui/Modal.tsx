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

    useEffect(() => {
        const determineEmbedUrl = async () => {
            setIsLoading(true);
            try {
                let url = '';

                if (selectedServer === "server1") {
                    if (isSeries && season && episode) {
                        url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE2}/media/tmdb-tv-${tmdbId}-${formattedTitle}`;
                    } else if (isPlay) {
                        url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE2}/media/tmdb-movie-${tmdbId}-${formattedTitle}`;
                    }
                } else {
                    if (isSeries && season && episode) {
                        url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`;
                    } else if (isPlay) {
                        url = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/movie/${tmdbId}`;
                    }
                }

                const isAvailable = await checkEmbedAvailability(url);
                setEmbedUrl(isAvailable ? url : `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`);
            } catch (error) {
                setEmbedUrl(`${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`);
            } finally {
                setIsLoading(false);
            }
        };

        determineEmbedUrl();
    }, [selectedServer, isSeries, isPlay, isTrailer, tmdbId, formattedTitle, season, episode, trailerKey]);

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
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
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
                                        className="absolute top-0 left-0 w-full h-full"
                                    />
                                )
                            )}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                className={`btn ${selectedServer === 'server1' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedServer("server1")}
                            >
                                Server 1
                            </button>
                            <button
                                className={`btn ${selectedServer === 'server2' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedServer("server2")}
                            >
                                Server 2
                            </button>
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