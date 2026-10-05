import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = { title: 'Anime' };

export default function Page() {
    return <CatalogClient />;
}
