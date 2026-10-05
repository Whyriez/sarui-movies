import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = { title: 'Top Rated TV Series' };

export default function Page() {
    return <CatalogClient />;
}
