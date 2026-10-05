This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## TMDB catalog behavior

The app fetches TMDB through `/api/tmdb/*`. Configure `TMDB_API_BEARER_TOKEN`
(or `TMDB_API_KEY`) and optionally `TMDB_BASE_URL` in `.env.local`. Existing
`NEXT_PUBLIC_TMDB_API_BEARER_TOKEN`, `NEXT_PUBLIC_API_KEY_TMDB`, and
`NEXT_PUBLIC_TMDB_BASE_URL` settings remain supported.

- Metadata uses `id-ID`. Indonesian movies and series prefer their original
  title/name, consistently in cards, details, and browser titles.
- Empty Indonesian synopses fall back to English in catalogs, search, details,
  seasons, and episodes. Only synopsis fields are copied, matched by media type
  and ID; localized titles and ordering stay intact. If both versions are empty
  or the optional fallback request fails, the UI shows `Sinopsis belum tersedia.`
- Catalogs and search omit adult entries, entries without a poster, and people.
  Explicit/erotic keywords are checked separately for movies and TV, including
  entries marked `adult: false`. Direct detail and season URLs use the same
  content policy. Keywords are cached for one hour; upstream failures show an
  error instead of unchecked content.
- Filtering relies on TMDB flags and keyword tags, not visual inspection of
  posters. Untagged explicit content can still require additional moderation.
- Search preserves TMDB relevance and its page boundaries. A filtered page may
  contain fewer entries or no entries; pagination still allows other pages.
- Broken posters and missing season posters show a local placeholder.
- Page metadata sets a specific title for each catalog, search, movie, series,
  and season. New browser visits use these titles; existing history records are
  not rewritten.

Run `npm test` for the TMDB filtering, localization, detail/season access, error,
and trailer fallback checks, and `npx tsc --noEmit` for type checking.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
