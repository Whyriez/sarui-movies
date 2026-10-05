import type { Metadata } from 'next';
import SearchClient from './SearchClient';

type Props = { searchParams: { query?: string; page?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
    const query = searchParams.query?.trim();
    return { title: query ? `Pencarian: ${query}` : 'Pencarian' };
}

export default function SearchPage({ searchParams }: Props) {
    const page = Number(searchParams.page ?? 1);
    return <SearchClient searchParams={{
        query: searchParams.query?.trim() ?? '',
        page: Number.isInteger(page) && page >= 1 && page <= 500 ? page : 1,
    }} />;
}
