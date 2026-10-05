import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = { title: 'Trending TV Series' };

export default function Page() {
    return <CatalogClient />;
}
