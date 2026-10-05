import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = { title: 'Popular Movies' };

export default function Page() {
    return <CatalogClient />;
}
