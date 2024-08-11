'use client'
import { useEffect, useState } from 'react'

interface Modal {
    id: string;
    contentType: 'play' | 'trailer';
    tmdbId: string;
    trailerKey?: string;
}
const Modal: React.FC<Modal> = ({ id, contentType, tmdbId, trailerKey }) => {
    const isPlay = contentType === 'play';
    const isTrailer = contentType === 'trailer' && trailerKey;


    useEffect(() => {

        const modalElement = document.getElementById(id) as HTMLDialogElement | null;

        const handleClose = () => {
            if (modalElement) {
                // Mengambil iframe dari modal
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
                            {isPlay && (
                                <iframe
                                    src={`https://vidsrc.xyz/embed/movie/${tmdbId}`}
                                    title="Movie Embed"
                                    frameBorder="0"
                                    allowFullScreen
                                   
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            )}
                            {isTrailer && (
                                <iframe
                                    src={`https://www.youtube.com/embed/${trailerKey}`}
                                    title="Trailer Embed"
                                    frameBorder="0"
                                    allowFullScreen
                                    
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            )}
                        </div>
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                    </div>
                </div>
            </dialog>
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                }
                .modal {
                    z-index: 1000;
                }
            `}</style>
        </div>
    )
}

export default Modal