const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadRoute(customEnv = {}) {
  const code = ts.transpileModule(
    fs.readFileSync(path.resolve(__dirname, '../src/app/api/license/verify/route.ts'), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }
  ).outputText;

  const module = { exports: {} };
  const requireLocal = (name) => {
    if (name === 'next/server') {
      return {
        NextRequest: class {},
        NextResponse: {
          json: (body, init = {}) => ({
            status: init.status || 200,
            body,
            json: async () => body,
          }),
        },
      };
    }
    if (name === '@/lib/license' || name.endsWith('license')) {
      const licCode = ts.transpileModule(
        fs.readFileSync(path.resolve(__dirname, '../src/lib/license.ts'), 'utf8'),
        {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
        }
      ).outputText;
      const licModule = { exports: {} };
      new Function('require', 'module', 'exports', licCode)(() => ({}), licModule, licModule.exports);
      return licModule.exports;
    }
    return require(name);
  };

  const processMock = {
    env: {
      STREAM_LICENSE_KEY: 'SARUI-MASTER-VIP-2026',
      ...customEnv,
    },
  };

  new Function('require', 'module', 'exports', 'process', code)(
    requireLocal,
    module,
    module.exports,
    processMock
  );
  return module.exports;
}

function makeRequest(body) {
  return {
    json: async () => body,
  };
}

test('verifies demo license key and returns 30m duration', async () => {
  const route = loadRoute();
  const res = await route.POST(makeRequest({ key: 'DEMO-SARUI-30M' }));
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.valid, true);
  assert.equal(json.type, 'demo');
  assert.ok(json.expiresAt > Date.now());
  assert.ok(json.expiresAt <= Date.now() + 31 * 60 * 1000);
});

test('verifies master owner license key with permanent access', async () => {
  const route = loadRoute({ STREAM_LICENSE_KEY: 'MY-OWNER-KEY-123' });
  const res = await route.POST(makeRequest({ key: 'MY-OWNER-KEY-123' }));
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.valid, true);
  assert.equal(json.type, 'master');
  assert.equal(json.expiresAt, null);
});

test('verifies MAGANGBPS2026 configured key for 6 months duration', async () => {
  const route = loadRoute();
  const before = Date.now();
  const res = await route.POST(makeRequest({ key: 'MAGANGBPS2026' }));
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.valid, true);
  assert.equal(json.type, 'custom');
  assert.equal(json.name, 'Magang BPS 2026');
  assert.ok(json.expiresAt > before);

  // Approximately 6 months in the future (~180-184 days)
  const daysDiff = (json.expiresAt - before) / (1000 * 60 * 60 * 24);
  assert.ok(daysDiff >= 179 && daysDiff <= 186, `Expected ~180 days, got ${daysDiff}`);
});

test('verifies custom key configured via CUSTOM_LICENSE_KEYS env variable (JSON and CSV)', async () => {
  // Test JSON format in env
  const routeJson = loadRoute({
    CUSTOM_LICENSE_KEYS: JSON.stringify([
      { key: 'TEST90DAYS', name: 'Test Key 90', durationDays: 90 },
    ]),
  });
  const resJson = await routeJson.POST(makeRequest({ key: 'TEST90DAYS' }));
  const dataJson = await resJson.json();

  assert.equal(resJson.status, 200);
  assert.equal(dataJson.valid, true);
  assert.equal(dataJson.type, 'custom');
  assert.equal(dataJson.name, 'Test Key 90');
  const daysDiffJson = (dataJson.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
  assert.ok(daysDiffJson >= 89 && daysDiffJson <= 91);

  // Test CSV format in env: KEY:DAYS:NAME
  const routeCsv = loadRoute({
    CUSTOM_LICENSE_KEYS: 'PARTNER30:30:Partner Pass,EVENT7:7:Event Pass',
  });
  const resCsv = await routeCsv.POST(makeRequest({ key: 'PARTNER30' }));
  const dataCsv = await resCsv.json();

  assert.equal(resCsv.status, 200);
  assert.equal(dataCsv.valid, true);
  assert.equal(dataCsv.type, 'custom');
  assert.equal(dataCsv.name, 'Partner Pass');
  const daysDiffCsv = (dataCsv.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
  assert.ok(daysDiffCsv >= 29 && daysDiffCsv <= 31);
});

test('rejects missing or invalid license keys', async () => {
  const route = loadRoute();

  // Empty key
  const resEmpty = await route.POST(makeRequest({ key: '   ' }));
  assert.equal(resEmpty.status, 400);
  const dataEmpty = await resEmpty.json();
  assert.equal(dataEmpty.valid, false);

  // Unregistered key
  const resBad = await route.POST(makeRequest({ key: 'RANDOM-INVALID-KEY' }));
  assert.equal(resBad.status, 401);
  const dataBad = await resBad.json();
  assert.equal(dataBad.valid, false);
});

