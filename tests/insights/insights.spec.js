// Suite: Activity, analytics, searches (read-only - creates nothing)
const { test } = require('../../src/fixtures/api.fixture');
const { InsightsService } = require('../../src/services/insights.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

test.describe('Activity, analytics, searches', () => {
  // Test ID: T0491
  // Test Title: Verify that activity logs return HTTP 200
  test('T0491 | Positive | Verify that activity logs return HTTP 200', async ({ api }) => {
    // Step 1: Fetch activity logs.
    expectOk(await new InsightsService(api).activityLogs(), { status: 200 });
  });

  // Test ID: T0492
  // Test Title: Verify that activity logs without a token are rejected with HTTP 401
  test('T0492 | Negative | Verify that activity logs without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new InsightsService(unauthApi).activityLogs(), 401);
  });

  // Test ID: T0493
  // Test Title: Verify that follow-up analytics return HTTP 200
  test('T0493 | Positive | Verify that follow-up analytics return HTTP 200', async ({ api }) => {
    // Step 1: Fetch analytics.
    expectOk(await new InsightsService(api).followupAnalytics(), { status: 200 });
  });

  // Test ID: T0494
  // Test Title: Verify that analytics without a token are rejected with HTTP 401
  test('T0494 | Negative | Verify that analytics without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new InsightsService(unauthApi).followupAnalytics(), 401);
  });

  // Test ID: T0495
  // Test Title: Verify that symptom search returns HTTP 200
  test('T0495 | Positive | Verify that symptom search returns HTTP 200', async ({ api }) => {
    // Step 1: Search symptoms.
    expectOk(await new InsightsService(api).symptomSearch('head'), { status: 200 });
  });

  // Test ID: T0496
  // Test Title: Verify that symptom search without a query returns HTTP 200
  test('T0496 | Edge | Verify that symptom search without a query returns HTTP 200', async ({ api }) => {
    // Step 1: Search without query (returns all — slow, no SLA assert).
    const res = await new InsightsService(api).symptomSearch();
    expectStatus(res, 200, 'Symptom search');
  });

  // Test ID: T0497
  // Test Title: Verify that city search returns HTTP 200
  test('T0497 | Positive | Verify that city search returns HTTP 200', async ({ api }) => {
    // Step 1: Search cities.
    expectOk(await new InsightsService(api).citySearch('mumb'), { status: 200 });
  });

  // Test ID: T0498
  // Test Title: Verify that a too-short city query is rejected with HTTP 422
  test('T0498 | Boundary | Verify that a too-short city query is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Search with 1 char (min 2).
    expectError(await new InsightsService(api).citySearch('m'), 422);
  });

  // Test ID: T0499
  // Test Title: Verify that city search is public and returns HTTP 200 without a token
  test('T0499 | Edge | Verify that city search is public and returns HTTP 200 without a token', async ({ unauthApi }) => {
    // Step 1: Search without token (public endpoint — quirk, no auth guard).
    expectOk(await new InsightsService(unauthApi).citySearch('mumb'), { status: 200 });
  });
});
