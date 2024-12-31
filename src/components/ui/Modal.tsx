'use client'
import { useEffect, useState } from 'react'
import * as cheerio from 'cheerio';

interface Modal {
    id: string;
    contentType: 'play' | 'trailer' | 'series';
    tmdbId: string;
    trailerKey?: string;
    season?: string;
    episode?: number; 
}
const Modal: React.FC<Modal> = ({ id, contentType, tmdbId, trailerKey, season, episode }) => {
    const isPlay = contentType === 'play';
    const isTrailer = contentType === 'trailer' && trailerKey;
    const isSeries = contentType === 'series';
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [serverData, setServerData] = useState<{ name: string, hash: string }[]>([]);

    useEffect(() => {
        const fetchAndCleanHtml = async () => {
            if (isPlay) {
                const res = await fetch(`https://vidsrc.io/embed/movie/${tmdbId}`);
                const html = await res.text();

                const $ = cheerio.load(html);

                const iframeSrc = $('#player_iframe').attr('src');
                setIframeSrc(iframeSrc || null);

                const servers = $('.server')
                    .map((i, el) => {
                        const name = $(el).text().trim(); 
                        const hash = $(el).attr('data-hash');
                        return hash ? { name, hash } : null;
                    })
                    .get()
                    .filter((server): server is { name: string; hash: string } => server !== null);

                setServerData(servers);

            } else if (isTrailer) {
                setIframeSrc(`${process.env.NEXT_PUBLIC_YOUTUBE}/embed/${trailerKey}`);
            }
        };

        fetchAndCleanHtml();
    }, [tmdbId, trailerKey, isPlay, isTrailer]);


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
                            {/* {iframeSrc && (
                                <div>
                                    <iframe
                                        src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/embed/movie/${tmdbId}`} 
                                        title={isPlay ? "Movie Embed" : "Trailer Embed"}
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full"
                                    />

                                </div>
                            )} */}
                            {isSeries && (
                                <iframe
                                    src={`${process.env.NEXT_PUBLIC_VIDEO_EMBED}/tv/${tmdbId}/${season}/${episode}`}
                                    title="Series Embed"
                                    frameBorder="0"
                                    allowFullScreen
                                   
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            )}
                            
                            {isPlay && (
                                <iframe
                                    src={`${process.env.NEXT_PUBLIC_VIDEO_EMBED}/movie/${tmdbId}`}
                                    title="Movie Embed"
                                    frameBorder="0"
                                    allowFullScreen
                                   
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            )}
                            {isTrailer && (
                                <iframe
                                    src={`${process.env.NEXT_PUBLIC_YOUTUBE}/embed/${trailerKey}`}
                                    title="Trailer Embed"
                                    frameBorder="0"
                                    allowFullScreen

                                    className="absolute top-0 left-0 w-full h-full"
                                />
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