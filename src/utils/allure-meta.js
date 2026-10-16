/**
 * Allure metadata helper — annotates EVERY test automatically.
 * Called from the `api` / `unauthApi` fixtures (they run inside every test
 * and receive TestInfo), so no per-test edits are needed: the uniform title
 * format `Txxxx | Type | rest` + describe block carries all the data.
 *
 * Produces data-rich reports: epic (module), feature (suite), story (title),
 * severity (from type), owner, tags, test-case id, plus per-request
 * request/response JSON attachments (credentials redacted).
 */

const MODULE_BY_FILE = [
  [/health/, 'Health Checks'],
  [/auth/, 'Authentication & Session'],
  [/patient\//, 'Patient Management'],
  [/visits/, 'Patient Visits'],
  [/appointments/, 'Appointments'],
  [/therapy/, 'Therapy Management'],
  [/invoices/, 'Invoicing'],
  [/inquiry/, 'Inquiry Pipeline'],
  [/medbills/, 'Medicine Billing'],
  [/purchase/, 'Purchase & Suppliers'],
  [/users/, 'Users & Roles'],
  [/finance/, 'Finance & Stock'],
  [/branches/, 'Branches & Dashboard'],
  [/masters/, 'Settings Masters'],
  [/abdm/, 'ABDM Integration'],
  [/contract/, 'Contract Tests'],
];

const SEVERITY_BY_TYPE = {
  Positive: 'critical',
  Negative: 'normal',
  Edge: 'minor',
  Boundary: 'normal',
  Contract: 'critical',
};

function moduleFor(file = '') {
  const normalized = String(file).replace(/\\/g, '/');
  for (const [re, name] of MODULE_BY_FILE) {
    if (re.test(normalized)) return name;
  }
  return 'API Tests';
}

/**
 * Parse `T0026 | Positive | list appointments returns 200`
 * into { id, type, title }. Tolerates titles without a type segment.
 */
function parseTitle(title = '') {
  const parts = String(title).split('|').map((s) => s.trim());
  const id = /^T\d+$/.test(parts[0] || '') ? parts[0] : null;
  const knownTypes = Object.keys(SEVERITY_BY_TYPE);
  const type = knownTypes.includes(parts[1]) ? parts[1] : id ? 'Positive' : 'Positive';
  return { id, type, title: String(title).trim() };
}

/**
 * Push Allure labels for the running test via the allure runtime API.
 * (allure-playwright 2.x ignores testInfo.annotations for labels.)
 * Safe to call when no Allure reporter is active (calls no-op/throw internally —
 * guarded) and idempotent per test.
 */
async function annotateCurrentTest(testInfo) {
  if (!testInfo || testInfo.annotations.some((a) => a.type === 'allure-meta-applied')) return;
  testInfo.annotations.push({ type: 'allure-meta-applied' });

  const { id, type, title } = parseTitle(testInfo.title);
  const epic = moduleFor(testInfo.file);
  const feature =
    Array.isArray(testInfo.titlePath) && testInfo.titlePath.length > 1
      ? String(testInfo.titlePath[testInfo.titlePath.length - 2])
      : epic;
  const hasSmoke = /@smoke/.test(title);
  const severity = hasSmoke ? 'blocker' : SEVERITY_BY_TYPE[type] || 'normal';

  try {
    // Require lazily so unit contexts without the reporter still load this file.
    const { allure } = require('allure-playwright');
    await allure.epic(epic);
    await allure.feature(feature);
    await allure.story(title);
    await allure.severity(severity);
    await allure.owner('vm-qa-automation');
    await allure.tag(type.toLowerCase());
    await allure.tag('api');
    if (hasSmoke) await allure.tag('smoke');
    if (id) {
      await allure.id(id);
      await allure.tag(id);
    }
    await allure.description(
      `Test ID: ${id || 'n/a'}\nType: ${type}\nModule: ${epic}\nSuite: ${feature}\n\nSteps: see test source (// Step N comments).`
    );
  } catch {
    // ignore — reporting must never fail tests
  }
}

/** Keys whose values must never land in reports. */
const SENSITIVE_KEYS = new Set(['password', 'passwd', 'authorization', 'token', 'authtoken', 'auth_token']);

function redact(value, depth = 0) {
  if (depth > 4 || value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.has(String(k).toLowerCase()) ? '***REDACTED***' : redact(v, depth + 1);
    }
    return out;
  }
  if (typeof value === 'string' && /bearer\s+\S+/i.test(value)) return value.replace(/(bearer\s+)\S+/i, '$1***REDACTED***');
  return value;
}

/**
 * Attach a redacted request/response pair to the Allure report.
 * Awaited by the caller; failures are swallowed (reporting never fails tests).
 */
async function attachHttpExchange(testInfo, { method, url, requestBody, status, responseBody, durationMs }) {
  try {
    if (!testInfo || typeof testInfo.attach !== 'function') return;
    const path = String(url).split('?')[0].replace(/^https?:\/\/[^/]+/, '');
    const base = `${method.toUpperCase()} ${path} -> ${status} (${durationMs}ms)`;
    const payload = {
      request: redact(requestBody),
      response: redact(responseBody),
    };
    await testInfo.attach(`HTTP ${base}`, {
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(payload, null, 2)),
    });
  } catch {
    // ignore — reporting must never fail tests
  }
}

module.exports = { annotateCurrentTest, attachHttpExchange, parseTitle, moduleFor };
