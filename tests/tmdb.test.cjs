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

const movie = (id, extra = {}) => ({
    id,
    title: `Film ${id}`,
    adult: false,
    poster_path: '/poster.jpg',
    media_type: 'movie',
    overview: 'Sinopsis fixture.',
    release_date: '2020-01-01',
    status: 'Released',
    ...extra,
});
const list = results => ({ results, page: 1, total_pages: 7, total_results: 140 });

test('search removes missing posters, people, and unreleased content while allowing 18+ content', async () => {
    const { service, calls } = loadService(({ path: endpoint }) => {
        if (endpoint === 'search/multi') {
            return {
                body: list([
                    movie(1, { status: 'Released' }),
                    movie(2, { adult: true, status: 'Released' }), // 18+ content is allowed
                    movie(3, { poster_path: null }), // Missing poster removed
                    movie(4, { media_type: 'person' }), // Person removed
                    movie(5, { status: 'Post Production' }), // Post production removed
                    movie(6, { release_date: '2099-01-01' }), // Future unreleased removed
                ])
            };
        }
        return { body: { status: 'Released', poster_path: '/poster.jpg' } };
    });
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'film', language: 'en-US' }));
    assert.deepEqual(data.results.map(item => item.id), [1, 2]);
    assert.equal(data.total_pages, 7);
    assert.equal(calls[0].params.get('language'), 'en-US');
    assert.equal(calls[0].params.get('include_adult'), 'true');
});

test('catalog and trending keep upstream ordering and supply the correct media type', async () => {
    for (const endpoint of ['movie/popular', 'movie/now_playing', 'movie/upcoming', 'movie/top_rated', 'trending/movie/day']) {
        const { service } = loadService(({ path: requested }) => ({ body: requested === endpoint
            ? list([movie(9, { media_type: undefined, release_date: '2000-01-01', status: 'Released' }), movie(8, { release_date: '2026-01-01', status: 'Released' })])
            : { status: 'Released', poster_path: '/poster.jpg' } }));
        const data = await service.getTmdbData(endpoint, new URLSearchParams());
        assert.deepEqual(data.results.map(item => item.id), [9, 8]);
        assert.equal(data.results[0].media_type, 'movie');
    }
});

test('TV English and localized names appear in search and detail, and unreleased series are filtered', async () => {
    const raw = { id: 1, name: 'English Title', original_name: 'Judul Indonesia', original_language: 'id', media_type: 'tv', poster_path: '/tv.jpg', overview: 'English synopsis.', status: 'Returning Series', first_air_date: '2020-01-01' };
    const { service } = loadService(({ path: endpoint }) => {
        if (endpoint === 'search/multi') return { body: list([raw, { ...raw, id: 2, status: 'In Production' }]) };
        if (endpoint === 'tv/1') return { body: { ...raw, status: 'Returning Series' } };
        return { body: { status: endpoint === 'tv/2' ? 'In Production' : 'Returning Series', poster_path: '/tv.jpg' } };
    });
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'judul' }));
    assert.equal(data.results.length, 1);
    assert.equal(data.results[0].name, 'English Title');
    assert.equal((await service.getSafeDetails('tv', '1')).name, 'English Title');
});

test('all TV catalogs apply poster and release filters, allowing 18+ content', async () => {
    for (const endpoint of ['tv/popular', 'tv/top_rated', 'tv/airing_today', 'tv/on_the_air', 'trending/tv/day']) {
        const { service } = loadService(({ path: requested }) => ({ body: requested === endpoint
            ? list([
                { id: 1, name: 'Serial 1', poster_path: '/tv.jpg', status: 'Returning Series', first_air_date: '2020-01-01' },
                { id: 2, name: 'Serial 2', poster_path: null, status: 'Returning Series', first_air_date: '2020-01-01' }, // Missing poster
                { id: 3, name: 'Serial 3 (18+)', poster_path: '/tv.jpg', adult: true, status: 'Ended', first_air_date: '2020-01-01' }, // 18+ allowed
                { id: 4, name: 'Serial 4', poster_path: '/tv.jpg', status: 'Planned', first_air_date: '2099-01-01' }, // Planned unreleased
            ])
            : { status: requested === 'tv/4' ? 'Planned' : 'Returning Series', poster_path: '/tv.jpg' } }));
        const data = await service.getTmdbData(endpoint, new URLSearchParams());
        assert.deepEqual(data.results.map(item => item.id), [1, 3]);
        assert.equal(data.results[0].media_type, 'tv');
    }
});

test('movies use English localized title with original fallback', () => {
    const { policy } = loadService(() => ({}));
    assert.equal(policy.getMediaTitle(movie(1, { title: 'The Raid', original_title: 'Serbuan Maut', original_language: 'id' })), 'The Raid');
    assert.equal(policy.getMediaTitle(movie(1, { title: 'English Title', original_title: 'Original', original_language: 'ja' })), 'English Title');
    assert.equal(policy.getMediaTitle(movie(1, { title: '', original_title: 'Fallback' })), 'Fallback');
});

test('unreleased direct details and missing posters are blocked with 404', async () => {
    for (const unplayable of [
        { status: 'Post Production' },
        { status: 'In Production' },
        { status: 'Planned' },
        { poster_path: null },
        { poster_path: '' },
    ]) {
        const { service } = loadService(() => ({ body: { ...movie(1), ...unplayable } }));
        await assert.rejects(service.getSafeDetails('movie', '1'), error => error.status === 404);
        await assert.rejects(service.getSafeSeason('1', '1'), error => error.status === 404);
    }

    // 18+ movie with valid poster and Released status is allowed
    const { service } = loadService(() => ({ body: movie(1, { adult: true, status: 'Released', poster_path: '/poster.jpg' }) }));
    const safeAdult = await service.getSafeDetails('movie', '1');
    assert.equal(safeAdult.id, 1);
});

test('missing poster data does not expose direct details', async () => {
    const { service } = loadService(() => ({ body: movie(1, { poster_path: null }) }));
    await assert.rejects(service.getSafeDetails('movie', '1'), error => error.status === 404);
});

test('trailer falls back to English; absent trailers do not break details', async () => {
    const { service, calls } = loadService(({ params }) => ({ body: { results: [{ type: 'Trailer', site: 'YouTube', key: 'trailer' }] } }));
    assert.equal((await service.getVideos('movie', '1')).results[0].key, 'trailer');
    assert.deepEqual(calls.map(call => call.params.get('language')), ['en-US']);
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
        ? list([movie(1, { overview: '   ', title: 'English 1', original_title: 'Judul Asli', status: 'Released' }), movie(2, { status: 'Released' })])
        : { status: 'Released', poster_path: '/poster.jpg' } }));
    const data = await service.getTmdbData('movie/popular', new URLSearchParams());
    assert.deepEqual(data.results.map(item => item.id), [1, 2]);
    assert.equal(data.results[0].title, 'English 1');
    assert.equal(calls[0].params.get('language'), 'en-US');
});

test('search matches synopsis fallback by media type and ID, including items absent from English page', async () => {
    const { service } = loadService(({ path: endpoint, params }) => {
        if (endpoint === 'search/multi') return { body: list([movie(1, { overview: 'Movie synopsis', status: 'Released' }), { id: 1, name: 'English TV', media_type: 'tv', poster_path: '/tv.jpg', overview: 'TV synopsis', status: 'Returning Series', first_air_date: '2020-01-01' }, movie(2, { overview: 'Detail synopsis', status: 'Released' })]) };
        return { body: { status: 'Released', poster_path: '/tv.jpg' } };
    });
    const data = await service.getTmdbData('search/multi', new URLSearchParams({ query: 'film' }));
    assert.deepEqual(data.results.map(item => item.overview), ['Movie synopsis', 'TV synopsis', 'Detail synopsis']);
    assert.deepEqual(data.results.map(item => item.title ?? item.name), ['Film 1', 'English TV', 'Film 2']);
});

test('movie details retain Indonesian title when synopsis is borrowed from English', async () => {
    const { service } = loadService(({ params }) => ({ body: movie(1, { title: 'The Raid', original_title: 'Serbuan Maut', original_language: 'id', overview: 'English synopsis.', status: 'Released' }) }));
    const data = await service.getSafeDetails('movie', '1');
    assert.equal(data.title, 'The Raid');
    assert.equal(data.overview, 'English synopsis.');
});

test('series season summaries and season episode summaries fall back independently by ID', async () => {
    const { service } = loadService(({ path: endpoint, params }) => {
        if (endpoint === 'tv/1') return { body: { id: 1, name: 'English TV', poster_path: '/tv.jpg', status: 'Returning Series', first_air_date: '2020-01-01', overview: 'English synopsis.', seasons: [{ id: 20, name: 'Season 2', overview: 'Season 2 overview' }, { id: 10, name: 'Season 1', overview: 'Season 1 overview' }] } };
        return { body: { name: 'Season 1', poster_path: '/tv.jpg', overview: 'Season synopsis', episodes: [{ id: 200, name: 'Episode 2', overview: 'Episode 2 overview' }, { id: 100, overview: 'Episode 1 overview' }] } };
    });
    const tv = await service.getSafeDetails('tv', '1');
    assert.equal(tv.overview, 'English synopsis.');
    assert.deepEqual(tv.seasons.map(item => item.overview), ['Season 2 overview', 'Season 1 overview']);
    assert.equal(tv.seasons[0].name, 'Season 2');
    const season = await service.getSafeSeason('1', '1');
    assert.equal(season.name, 'Season 1');
    assert.equal(season.overview, 'Season synopsis');
    assert.deepEqual(season.episodes.map(item => item.overview), ['Episode 2 overview', 'Episode 1 overview']);
    assert.equal(season.episodes[0].name, 'Episode 2');
});

test('optional English failure keeps safe content accessible and displays an honest placeholder', async () => {
    const { service, policy, calls } = loadService(({ path: endpoint, params }) => {
        if (endpoint === 'movie/popular') return { body: list([movie(1, { overview: '', status: 'Released' })]) };
        if (endpoint === 'movie/1') return { body: movie(1, { overview: '', status: 'Released' }) };
        return { body: { status: 'Released', poster_path: '/poster.jpg' } };
    });
    const data = await service.getTmdbData('movie/popular', new URLSearchParams());
    assert.equal(data.results.length, 1);
    const detail = await service.getSafeDetails('movie', '1');
    assert.equal(policy.getOverviewText(detail.overview), 'Synopsis not available.');
    assert.equal(policy.getOverviewText('   '), 'Synopsis not available.');
});

test('complete localized synopses do not trigger English requests', async () => {
    const { service, calls } = loadService(({ path: endpoint }) => ({ body: endpoint === 'movie/popular'
        ? list([movie(1, { status: 'Released' })]) : endpoint === 'movie/1' ? movie(1, { status: 'Released' }) : { status: 'Released', poster_path: '/poster.jpg' } }));
    await service.getTmdbData('movie/popular', new URLSearchParams());
    await service.getSafeDetails('movie', '1');
    assert.ok(calls.every(call => call.params.get('language') === 'en-US'));
});
