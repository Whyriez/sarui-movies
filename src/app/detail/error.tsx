'use client';

export default function DetailError({ reset }: { reset: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4" role="alert">
            <p>Failed to load details. Please try again.</p>
            <button className="btn btn-primary" onClick={reset}>Try again</button>
        </div>
    );
}
