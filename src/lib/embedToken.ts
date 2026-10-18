import crypto from 'crypto';

const SECRET = process.env.STREAM_PROVIDER_SIGNING_SECRET || '90cb3c08d6a233c7de76870538cb643fafe655b5d16cf93e0ee91c24a13fe245';

/**
 * Menghasilkan token sekali pakai (ephemeral token) untuk iframe player
 * @param mediaId Contoh: '533535' (movie) atau '66732:1:1' (tv season 1 episode 1)
 * @param ttlSeconds Masa aktif token dalam detik (default 120 detik)
 */
export function generateEmbedToken(mediaId: string, ttlSeconds = 120): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${mediaId}:${exp}`;
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  return `${exp}.${sig}`;
}

