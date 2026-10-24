const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadWatchHistoryModule() {
  const code = ts.transpileModule(
    fs.readFileSync(path.resolve(__dirname, '../src/lib/watchHistory.ts'), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }
  ).outputText;

  const storage = new Map();
  const mockLocalStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  };

  const dispatchedEvents = [];
  const mockWindow = {
    localStorage: mockLocalStorage,
    dispatchEvent: (evt) => dispatchedEvents.push(evt),
  };

  const CustomEventClass = class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  };

  const moduleObj = { exports: {} };
  new Function('require', 'module', 'exports', 'window', 'localStorage', 'CustomEvent', code)(
    require,
    moduleObj,
    moduleObj.exports,
    mockWindow,
    mockLocalStorage,
    CustomEventClass
  );

  return { lib: moduleObj.exports, storage, dispatchedEvents };
}

test('formats progress time correctly for hours and minutes', () => {
  const { lib } = loadWatchHistoryModule();
  assert.equal(lib.formatProgressTime(0), '0:00');
  assert.equal(lib.formatProgressTime(65), '1:05');
  assert.equal(lib.formatProgressTime(3600), '1:00:00');
  assert.equal(lib.formatProgressTime(3665), '1:01:05');
});

test('saveWatchProgress adds a new movie entry and retrieves it', () => {
  const { lib } = loadWatchHistoryModule();
  lib.saveWatchProgress({
    tmdbId: '533535',
    mediaType: 'movie',
    title: 'Deadpool & Wolverine',
    posterPath: '/deadpool.jpg',
    progressSeconds: 120,
    durationSeconds: 7600,
  });

  const history = lib.getWatchHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].tmdbId, '533535');
  assert.equal(history[0].title, 'Deadpool & Wolverine');
  assert.equal(history[0].progressSeconds, 120);

  const single = lib.getWatchItem('533535', 'movie');
  assert.ok(single);
  assert.equal(single.title, 'Deadpool & Wolverine');
});

test('saveWatchProgress updates existing series episode and moves it to top', () => {
  const { lib } = loadWatchHistoryModule();

  // Watch episode 1
  lib.saveWatchProgress({
    tmdbId: '66732',
    mediaType: 'tv',
    title: 'Stranger Things',
    season: '1',
    episode: 1,
    progressSeconds: 500,
  });

  // Watch another movie
  lib.saveWatchProgress({
    tmdbId: '100',
    mediaType: 'movie',
    title: 'Interstellar',
  });

  let history = lib.getWatchHistory();
  assert.equal(history[0].tmdbId, '100');
  assert.equal(history[1].tmdbId, '66732');

  // Watch episode 2 of Stranger Things
  lib.saveWatchProgress({
    tmdbId: '66732',
    mediaType: 'tv',
    title: 'Stranger Things',
    season: '1',
    episode: 2,
    progressSeconds: 30,
  });

  history = lib.getWatchHistory();
  // Stranger Things should now be at the top
  assert.equal(history[0].tmdbId, '66732');
  assert.equal(history[0].episode, 2);
  assert.equal(history[0].progressSeconds, 30);
  // Total entries should still be 2 (deduped)
  assert.equal(history.length, 2);
});

test('isEpisodeWatched checks correct season and episode', () => {
  const { lib } = loadWatchHistoryModule();
  lib.saveWatchProgress({
    tmdbId: '66732',
    mediaType: 'tv',
    title: 'Stranger Things',
    season: '2',
    episode: 4,
  });

  assert.equal(lib.isEpisodeWatched('66732', '2', 3), true); // Prior episode is watched
  assert.equal(lib.isEpisodeWatched('66732', '2', 4), true); // Current episode is watched
  assert.equal(lib.isEpisodeWatched('66732', '2', 5), false); // Future episode is not watched
  assert.equal(lib.isEpisodeWatched('66732', '1', 1), false); // Different season
  assert.equal(lib.isEpisodeWatched('99999', '1', 1), false); // Non-existent show
});

test('removeWatchHistoryItem and clearWatchHistory work as expected', () => {
  const { lib } = loadWatchHistoryModule();
  lib.saveWatchProgress({ tmdbId: '1', mediaType: 'movie', title: 'Film 1' });
  lib.saveWatchProgress({ tmdbId: '2', mediaType: 'movie', title: 'Film 2' });

  assert.equal(lib.getWatchHistory().length, 2);

  lib.removeWatchHistoryItem('movie-1');
  assert.equal(lib.getWatchHistory().length, 1);
  assert.equal(lib.getWatchHistory()[0].tmdbId, '2');

  lib.clearWatchHistory();
  assert.equal(lib.getWatchHistory().length, 0);
});

