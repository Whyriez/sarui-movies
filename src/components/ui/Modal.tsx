'use client'
import { useEffect, useState } from 'react'
import * as cheerio from 'cheerio';

interface Modal {
    id: string;
    contentType: 'play' | 'trailer' | 'series';
    tmdbId: string;
    trailerKey?: string | null;
    season?: string;
    episode?: number;
}
const Modal: React.FC<Modal> = ({ id, contentType, tmdbId, trailerKey, season, episode }) => {
    const isPlay = contentType === 'play';
    const isTrailer = contentType === 'trailer' && trailerKey;
    const isSeries = contentType === 'series';
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                if (isSeries && season && episode) {
                    // Handle series URL
                    const primaryUrl = `${process.env.NEXT_PUBLIC_VIDEO_EMBED}/tv/${tmdbId}/${season}/${episode}`;
                    const alternativeUrl = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`;

                    const isPrimaryAvailable = await checkEmbedAvailability(primaryUrl);

                    setEmbedUrl(isPrimaryAvailable ? primaryUrl : alternativeUrl);
                } else if (isPlay) {
                    const primaryUrl = `${process.env.NEXT_PUBLIC_VIDEO_EMBED}/movie/${tmdbId}`;
                    const alternativeUrl = `${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/movie/${tmdbId}`;

                    const isPrimaryAvailable = await checkEmbedAvailability(primaryUrl);

                    setEmbedUrl(isPrimaryAvailable ? primaryUrl : alternativeUrl);
                } else if (isTrailer) {
                    setEmbedUrl(`${process.env.NEXT_PUBLIC_YOUTUBE}/embed/${trailerKey}`);
                }
            } catch (error) {
                if (isSeries) {
                    setEmbedUrl(`${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/tv/${tmdbId}/${season}/${episode}`);
                } else if (isPlay) {
                    setEmbedUrl(`${process.env.NEXT_PUBLIC_VIDEO_EMBED_ALTERNATIVE}/movie/${tmdbId}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        determineEmbedUrl();
    }, [isSeries, isPlay, isTrailer, tmdbId, season, episode, trailerKey]);

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
                        {/* <div className="servers">
                            <i className="serversToggle fas fa-cloud"></i>
                            <div className="serversList">
                                {serverData.map((server, index) => (
                                    <div key={index} className="server btn btn-secondary text-white" data-hash={server} onClick={() => handleServerClick(server.hash)}>
                                        {server.name}
                                    </div>
                                ))}
                            </div>
                        </div> */}
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