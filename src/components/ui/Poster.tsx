'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type PosterProps = Omit<ImageProps, 'src'> & { path?: string | null; size?: 'w200' | 'w500' };

export default function Poster({ path, size = 'w500', ...props }: PosterProps) {
    const [failedPath, setFailedPath] = useState<string | null>();
    const validPath = path && /^\/[^\s]+$/.test(path) ? path : null;
    const src = validPath && failedPath !== validPath
        ? `${(process.env.NEXT_PUBLIC_IMAGE_TMDB || 'https://image.tmdb.org').replace(/\/$/, '')}/t/p/${size}${validPath}`
        : '/poster-placeholder.svg';
    return <Image {...props} src={src} onError={() => setFailedPath(validPath)} />;
}
