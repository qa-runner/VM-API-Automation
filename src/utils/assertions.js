/**
 * Central assertions — every test uses these so failures read the same way.
 * - expectStatus: exact HTTP status with body dump on mismatch.
 * - expectSchema: zod validation with readable errors.
 * - expectResponseTime: SLA guard.
 * - expectOk / expectError: common envelopes { success, status, ... }.
 */
const { expect } = require('@playwright/test');
const { env } = require('../config/env');

function bodyPreview(body) {
  try {
    return JSON.stringify(body)?.slice(0, 1500);
  } catch {
    return String(body)?.slice(0, 1500);
  }
}

function expectStatus(result, expected, message) {
  expect(result.body, `${message || 'response body'} (HTTP ${result.status}, expected ${expected}): ${bodyPreview(result.body)}`).toBeTruthy();
  expect(result.status, `${message || 'HTTP status'} — body: ${bodyPreview(result.body)}`).toBe(expected);
}

function expectResponseTime(result, maxMs = env.slaMs) {
  expect(result.ms, `Response took ${result.ms}ms, SLA is ${maxMs}ms`).toBeLessThanOrEqual(maxMs);
}

/** Validate body against a zod schema; fails with flattened field errors. */
function expectSchema(schema, body, message) {
  const parsed = schema.safeParse(body);
  expect(
    parsed.success,
    `${message || 'Schema mismatch'}: ${parsed.success ? '' : JSON.stringify(parsed.error.flatten(), null, 2).slice(0, 3000)}\nBody: ${bodyPreview(body)}`
  ).toBe(true);
  return parsed.success ? parsed.data : null;
}

/** Happy-path envelope: { success: true, status: 200 } (Laravel style). */
function expectOk(result, { status = 200 } = {}) {
  expectStatus(result, status, 'Expected success');
  if (result.body && typeof result.body === 'object' && 'success' in result.body) {
    expect(result.body.success, `Expected success=true, got: ${bodyPreview(result.body)}`).toBe(true);
  }
  expectResponseTime(result);
}

/** Error envelope: just asserts status + that a body/message exists. */
function expectError(result, expectedStatus) {
  expectStatus(result, expectedStatus, 'Expected error status');
  expect(result.body, 'Error response should include a body').toBeTruthy();
}

module.exports = { expectStatus, expectResponseTime, expectSchema, expectOk, expectError, bodyPreview };
