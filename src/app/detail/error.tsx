'use client';

export default function DetailError({ reset }: { reset: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4" role="alert">
            <p>Detail gagal dimuat. Silakan coba lagi.</p>
            <button className="btn btn-primary" onClick={reset}>Coba lagi</button>
        </div>
    );
}
