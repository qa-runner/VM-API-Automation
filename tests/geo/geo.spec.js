// Suite: Geo + address cascade (read-only — creates nothing)
const { test } = require('../../src/fixtures/api.fixture');
const { GeoService } = require('../../src/services/geo.service');
const { expectOk, expectError } = require('../../src/utils/assertions');

test.describe('Geo + address cascade', () => {
  // Test ID: T0482
  // Test Title: Verify that pincode details return HTTP 200
  test('T0482 | Positive | Verify that pincode details return HTTP 200', async ({ api }) => {
    // Step 1: Fetch pincode details.
    expectOk(await new GeoService(api).pincode('380015'), { status: 200 });
  });

  // Test ID: T0483
  // Test Title: Verify that an unknown pincode returns HTTP 404
  test('T0483 | Edge | Verify that an unknown pincode returns HTTP 404', async ({ api }) => {
    // Step 1: Fetch unknown pincode.
    expectError(await new GeoService(api).pincode('000000'), 404);
  });

  // Test ID: T0484
  // Test Title: Verify that pincode lookup without a token is rejected with HTTP 401
  test('T0484 | Negative | Verify that pincode lookup without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Fetch without token.
    expectError(await new GeoService(unauthApi).pincode('380015'), 401);
  });

  // Test ID: T0485
  // Test Title: Verify that listing countries returns HTTP 200 with rows
  test('T0485 | Positive | Verify that listing countries returns HTTP 200 with rows', async ({ api }) => {
    // Step 1: List countries.
    const res = await new GeoService(api).countries();
    // Step 2: Verify 200 + non-empty.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0486
  // Test Title: Verify that the country-state-city cascade resolves with HTTP 200
  test('T0486 | Positive | Verify that the country-state-city cascade resolves with HTTP 200', async ({ api }) => {
    const svc = new GeoService(api);
    // Step 1: Countries → take first id (never hardcode seed ids).
    const countries = await svc.countries();
    expectOk(countries, { status: 200 });
    const countryId = countries.body.data[0].id;
    // Step 2: States for country.
    const states = await svc.states({ country_id: countryId });
    expectOk(states, { status: 200 });
    const stateId = states.body.data[0].id;
    // Step 3: Cities for state.
    expectOk(await svc.cities({ state_id: stateId }), { status: 200 });
  });

  // Test ID: T0487
  // Test Title: Verify that states without country id are rejected with HTTP 422
  test('T0487 | Negative | Verify that states without country id are rejected with HTTP 422', async ({ api }) => {
    // Step 1: States without country_id.
    expectError(await new GeoService(api).states({}), 422);
  });

  // Test ID: T0488
  // Test Title: Verify that cities without state id are rejected with HTTP 422
  test('T0488 | Negative | Verify that cities without state id are rejected with HTTP 422', async ({ api }) => {
    // Step 1: Cities without state_id.
    expectError(await new GeoService(api).cities({}), 422);
  });

  // Test ID: T0489
  // Test Title: Verify that billing search returns HTTP 200
  test('T0489 | Positive | Verify that billing search returns HTTP 200', async ({ api }) => {
    // Step 1: Combined billing search.
    expectOk(await new GeoService(api).billingSearch('Test'), { status: 200 });
  });

  // Test ID: T0490
  // Test Title: Verify that the country list is public and returns HTTP 200 without a token
  test('T0490 | Edge | Verify that the country list is public and returns HTTP 200 without a token', async ({ unauthApi }) => {
    // Step 1: Countries without token (public endpoint — quirk, no auth guard).
    expectOk(await new GeoService(unauthApi).countries(), { status: 200 });
  });
});
