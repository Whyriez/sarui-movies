const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the TypeScript service with an isolated upstream, without a Next server.
function loadService(respond) {
    const calls = [];
    const modules = new Map();
    const upstream = async (url, options) => {
        const parsed = new URL(url);
        calls.push({ path: parsed.pathname.replace('/3/', ''), params: parsed.searchParams, options });
        const result = await respond(calls.at(-1));
        return { ok: (result.status ?? 200) === 200, status: result.status ?? 200, json: async () => result.body };
    };
    function load(filename) {
        if (modules.has(filename)) return modules.get(filename);
        const module = { exports: {} };
        modules.set(filename, module.exports);
        const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }).outputText;
        const requireLocal = name => {
            if (name === 'server-only') return {};
            if (name === 'react') return { cache: fn => fn };
            if (name.startsWith('.')) return load(path.resolve(path.dirname(filename), `${name}.ts`));
            return require(name);
        };
        const env = { TMDB_BASE_URL: 'https://tmdb.test/3', TMDB_API_BEARER_TOKEN: 'fixture-token' };
        new Function('require', 'module', 'exports', 'fetch', 'process', code)(requireLocal, module, module.exports, upstream, { env });
        return module.exports;
    }
    return { service: load(path.resolve(__dirname, '../src/lib/tmdb-server.ts')), policy: load(path.resolve(__dirname, '../src/lib/tmdb-policy.ts')), calls };
}

const movie = (id, extra = {}) => ({ id, title: `Film ${id}`, adult: false, poster_path: '/poster.jpg', media_type: 'movie', overview: 'Sinopsis fixture.', ...extra });
const list = results => ({ results, page: 1, total_pages: 7, total_results: 140 });

test('search removes adults, missing posters, people, and erotic content marked adult=false', async () => {
    const { service, calls } = loadService(({ path: endpoint }) => ({ body: endpoint === 'search/multi'
        ? list([movie(1), movie(2, { adult: true }), movie(3, { poster_path: null }), movie(4, { media_type: 'person' }), movie(5)])
        : { keywords: endpoint === 'movie/5/keywords' ? [{ name: 'Erotic Thriller' }] : [] } }));
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'film', include_adult: 'true', language: 'en-US' }));
    assert.deepEqual(data.results.map(item => item.id), [1]);
    assert.equal(data.total_pages, 7);
    assert.equal(calls[0].params.get('language'), 'id-ID');
    assert.equal(calls[0].params.get('include_adult'), 'false');
    assert.deepEqual(calls.slice(1).map(call => call.path), ['movie/1/keywords', 'movie/5/keywords']);
});

test('catalog and trending keep upstream ordering and supply the correct media type', async () => {
    for (const endpoint of ['movie/popular', 'movie/now_playing', 'movie/upcoming', 'movie/top_rated', 'trending/movie/day']) {
        const { service } = loadService(({ path: requested }) => ({ body: requested === endpoint
            ? list([movie(9, { media_type: undefined, release_date: '2000-01-01' }), movie(8, { release_date: '2026-01-01' })]) : { keywords: [] } }));
        const data = await service.getTmdbData(endpoint, new URLSearchParams());
        assert.deepEqual(data.results.map(item => item.id), [9, 8]);
        assert.equal(data.results[0].media_type, 'movie');
    }
});

test('TV keywords use results, and Indonesian original names appear in search and detail', async () => {
    const raw = { id: 1, name: 'English Title', original_name: 'Judul Indonesia', original_language: 'id', media_type: 'tv', poster_path: '/tv.jpg', overview: 'Sinopsis fixture.' };
    const { service } = loadService(({ path: endpoint }) => ({ body: endpoint === 'search/multi' ? list([raw, { ...raw, id: 2 }])
        : endpoint === 'tv/1' ? { ...raw, keywords: { results: [] } }
        : { results: endpoint === 'tv/2/keywords' ? [{ name: 'hentai' }] : [] } }));
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'judul' }));
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].name, 'Judul Indonesia');
    assert.equal((await service.getSafeDetails('tv', '1')).name, 'Judul Indonesia');
});

test('all TV catalogs apply poster and adult filters', async () => {
    for (const endpoint of ['tv/popular', 'tv/top_rated', 'tv/airing_today', 'tv/on_the_air', 'trending/tv/day']) {
        const { service } = loadService(({ path: requested }) => ({ body: requested === endpoint
            ? list([{ id: 1, name: 'Serial', poster_path: '/tv.jpg' }, { id: 2, name: 'Serial', poster_path: null }, { id: 3, name: 'Serial', poster_path: '/tv.jpg', adult: true }])
            : { results: [] } }));
        const data = await service.getTmdbData(endpoint, new URLSearchParams());
        assert.deepEqual(data.results.map(item => item.id), [1]);
        assert.equal(data.results[0].media_type, 'tv');
    }
});

test('Indonesian original movie title overrides English; foreign movies use localized title', () => {
    const { policy } = loadService(() => ({}));
    assert.equal(policy.getMediaTitle(movie(1, { title: 'The Raid', original_title: 'Serbuan Maut', original_language: 'id' })), 'Serbuan Maut');
    assert.equal(policy.getMediaTitle(movie(1, { title: 'Judul lokal', original_title: 'Original', original_language: 'ja' })), 'Judul lokal');
    assert.equal(policy.getMediaTitle(movie(1, { title: '', original_title: 'Fallback' })), 'Fallback');
    assert.equal(policy.hasExplicitKeywords({ keywords: [{ name: 'romance' }, { name: 'drama' }] }), false);
    assert.equal(policy.hasExplicitKeywords({ keywords: [{ name: 'bdsm' }] }), true);
});

test('unsafe direct details and seasons are blocked before loading episodes', async () => {
    for (const unsafe of [{ adult: true, keywords: { keywords: [] } }, { adult: false, keywords: { keywords: [{ name: 'pornography' }] } }]) {
        const { service, calls } = loadService(() => ({ body: { ...movie(1), ...unsafe } }));
        await assert.rejects(service.getSafeDetails('movie', '1'), error => error.status === 404);
        await assert.rejects(service.getSafeSeason('1', '1'), error => error.status === 404);
        assert.ok(!calls.some(call => call.path.includes('/season/')));
    }
});

test('missing moderation data does not expose direct details', async () => {
    const { service } = loadService(() => ({ body: movie(1) }));
    await assert.rejects(service.getSafeDetails('movie', '1'), error => error.status === 404);
});

test('keyword failure is surfaced instead of displaying unchecked items', async () => {
    const { service } = loadService(({ path: endpoint }) => endpoint === 'movie/popular'
        ? { body: list([movie(1)]) } : { status: 503 });
    await assert.rejects(service.getTmdbData('movie/popular', new URLSearchParams()), error => error.status === 502);
});

test('trailer falls back to English; absent trailers do not break details', async () => {
    const { service, calls } = loadService(({ params }) => ({ body: { results: params.get('language') === 'id-ID' ? [] : [{ type: 'Trailer', site: 'YouTube', key: 'trailer' }] } }));
    assert.equal((await service.getVideos('movie', '1')).results[0].key, 'trailer');
    assert.deepEqual(calls.map(call => call.params.get('language')), ['id-ID', 'en-US']);
    const unavailable = loadService(() => ({ status: 503 })).service;
    assert.deepEqual(await unavailable.getVideos('tv', '1'), { results: [] });
});

test('empty searches do not fetch; invalid IDs, pages and unlisted endpoints are rejected', async () => {
    const { service, calls } = loadService(() => { throw new Error('Unexpected network request'); });
    assert.deepEqual((await service.getTmdbData('search/multi', new URLSearchParams({ query: '  ' }))).results, []);
    for (const page of ['0', '-1', '501', 'nope']) await assert.rejects(service.getTmdbData('movie/popular', new URLSearchParams({ page })), error => error.status === 400);
    await assert.rejects(service.getSafeDetails('movie', '../1'), error => error.status === 400);
    await assert.rejects(service.getTmdbData('person/popular', new URLSearchParams()), error => error.status === 404);
    assert.equal(calls.length, 0);
});

test('catalog fills only empty synopses with one English page, preserving titles and ranking', async () => {
    const { service, calls } = loadService(({ path: endpoint, params }) => ({ body: endpoint === 'movie/popular'
        ? params.get('language') === 'id-ID'
            ? list([movie(1, { overview: '   ', original_title: 'Judul Asli', original_language: 'id' }), movie(2)])
            : list([movie(2, { title: 'English 2', overview: 'English 2 synopsis' }), movie(1, { title: 'English 1', overview: 'English synopsis' })])
        : { keywords: [] } }));
    const data = await service.getTmdbData('movie/popular', new URLSearchParams());
    assert.deepEqual(data.results.map(item => item.id), [1, 2]);
    assert.equal(data.results[0].overview, 'English synopsis');
    assert.equal(data.results[0].title, 'Judul Asli');
    assert.equal(data.results[1].overview, 'Sinopsis fixture.');
    assert.equal(calls.filter(call => call.params.get('language') === 'en-US').length, 1);
});

test('search matches synopsis fallback by media type and ID, including items absent from English page', async () => {
    const { service } = loadService(({ path: endpoint, params }) => {
        if (endpoint === 'search/multi') return { body: params.get('language') === 'id-ID'
            ? list([movie(1, { overview: '' }), { id: 1, name: 'Serial Lokal', media_type: 'tv', poster_path: '/tv.jpg', overview: '' }, movie(2, { overview: '' })])
            : list([{ id: 1, name: 'English TV', media_type: 'tv', overview: 'TV synopsis' }, movie(1, { overview: 'Movie synopsis' })]) };
        if (endpoint === 'movie/2') return { body: movie(2, { title: 'English title', overview: 'Detail synopsis' }) };
        return { body: { keywords: [], results: [] } };
    });
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'film' }));
    assert.deepEqual(data.results.map(item => item.overview), ['Movie synopsis', 'TV synopsis', 'Detail synopsis']);
    assert.deepEqual(data.results.map(item => item.title ?? item.name), ['Film 1', 'Serial Lokal', 'Film 2']);
});

test('movie details retain Indonesian title when synopsis is borrowed from English', async () => {
    const { service } = loadService(({ params }) => ({ body: params.get('language') === 'id-ID'
        ? { ...movie(1, { title: 'Serbuan Maut', original_title: 'Serbuan Maut', original_language: 'id', overview: '' }), keywords: { keywords: [] } }
        : movie(1, { title: 'The Raid', overview: 'English synopsis.' }) }));
    const data = await service.getSafeDetails('movie', '1');
    assert.equal(data.title, 'Serbuan Maut');
    assert.equal(data.overview, 'English synopsis.');
});

test('series season summaries and season episode summaries fall back independently by ID', async () => {
    const { service } = loadService(({ path: endpoint, params }) => {
        if (endpoint === 'tv/1') return { body: params.get('language') === 'id-ID'
            ? { id: 1, name: 'Serial Lokal', overview: 'Sinopsis lokal.', keywords: { results: [] }, seasons: [{ id: 20, name: 'Musim kedua', overview: '' }, { id: 10, name: 'Musim pertama', overview: 'Lokal.' }] }
            : { id: 1, name: 'English TV', overview: 'English TV synopsis', seasons: [{ id: 10, overview: 'English first' }, { id: 20, overview: 'English second' }] } };
        return { body: params.get('language') === 'id-ID'
            ? { name: 'Musim lokal', overview: '', episodes: [{ id: 200, name: 'Episode lokal', overview: '  ' }, { id: 100, overview: 'Lokal.' }] }
            : { name: 'English season', overview: 'Season synopsis', episodes: [{ id: 100, overview: 'English first' }, { id: 200, overview: 'English second' }] } };
    });
    const tv = await service.getSafeDetails('tv', '1');
    assert.equal(tv.overview, 'Sinopsis lokal.');
    assert.deepEqual(tv.seasons.map(item => item.overview), ['English second', 'Lokal.']);
    assert.equal(tv.seasons[0].name, 'Musim kedua');
    const season = await service.getSafeSeason('1', '1');
    assert.equal(season.name, 'Musim lokal');
    assert.equal(season.overview, 'Season synopsis');
    assert.deepEqual(season.episodes.map(item => item.overview), ['English second', 'Lokal.']);
    assert.equal(season.episodes[0].name, 'Episode lokal');
});

test('optional English failure keeps safe content accessible and displays an honest placeholder', async () => {
    const { service, policy, calls } = loadService(({ path: endpoint, params }) => {
        if (params.get('language') === 'en-US') return { status: 503 };
        if (endpoint === 'movie/popular') return { body: list([movie(1, { overview: '' })]) };
        if (endpoint === 'movie/1') return { body: { ...movie(1, { overview: '' }), keywords: { keywords: [] } } };
        return { body: { keywords: [] } };
    });
    const data = await service.getTmdbData('movie/popular', new URLSearchParams());
    assert.equal(data.results.length, 1);
    assert.equal(calls.filter(call => call.params.get('language') === 'en-US').length, 1);
    const detail = await service.getSafeDetails('movie', '1');
    assert.equal(policy.getOverviewText(detail.overview), 'Sinopsis belum tersedia.');
    assert.equal(policy.getOverviewText('   '), 'Sinopsis belum tersedia.');
});

test('complete localized synopses do not trigger English requests', async () => {
    const { service, calls } = loadService(({ path: endpoint }) => ({ body: endpoint === 'movie/popular'
        ? list([movie(1)]) : endpoint === 'movie/1' ? { ...movie(1), keywords: { keywords: [] } } : { keywords: [] } }));
    await service.getTmdbData('movie/popular', new URLSearchParams());
    await service.getSafeDetails('movie', '1');
    assert.ok(calls.every(call => call.params.get('language') === 'id-ID'));
});
