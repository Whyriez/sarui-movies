import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchClient from './SearchClient';
import Skeleton from '@/components/ui/Skeleton';

type Props = { searchParams: { query?: string; page?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
    const query = searchParams.query?.trim();
    return { title: query ? `Pencarian: ${query}` : 'Pencarian' };
}

export default function SearchPage({ searchParams }: Props) {
    const page = Number(searchParams.page ?? 1);
    return (
        <Suspense fallback={
            <div className="bg-zinc-50 dark:bg-[#09090b] min-h-screen pt-24 max-w-7xl mx-auto px-3 sm:px-6">
                <Skeleton count={10} />
            </div>
        }>
            <SearchClient searchParams={{
                query: searchParams.query?.trim() ?? '',
                page: Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1,
            }} />
        </Suspense>
    );
}
