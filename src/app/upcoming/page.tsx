import type { Metadata } from 'next';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = { title: 'Upcoming Movies' };

export default function Page() {
    return <CatalogClient />;
}
