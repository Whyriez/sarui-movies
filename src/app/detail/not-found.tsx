import Link from 'next/link';

export default function DetailNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl font-bold">Konten tidak tersedia</h1>
            <Link className="btn btn-primary" href="/">Kembali ke beranda</Link>
        </div>
    );
}
