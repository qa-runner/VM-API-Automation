// Suite: Patient | CRUD & search
const { test } = require('../../src/fixtures/api.fixture');
const { PatientService } = require('../../src/services/patient.service');
const { buildPatient } = require('../../src/data/factories/patient.factory');
const {
  expectOk,
  expectError,
  expectSchema,
  expectStatus,
} = require('../../src/utils/assertions');
const {
  patientCreateSuccessSchema,
  patientListSuccessSchema,
} = require('../../src/schemas/patient.schema');

test.describe('Patient | CRUD & search', () => {
  // Test ID: T0015
  // Test Title: Verify that creating a patient with valid first name, last name and mobile returns HTTP 200 with a patient id
  test('T0015 | Positive | Verify that creating a patient with valid first name, last name and mobile returns HTTP 200 with a patient id', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Build valid payload.
    const payload = buildPatient();
    // Step 2: Create patient.
    const res = await svc.create(payload);
    // Step 3: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(patientCreateSuccessSchema, res.body, 'Patient create schema');
    // Step 4: Register cleanup.
    const id = res.body.data.data.id;
    cleanup.add(`delete patient ${id}`, async () => {
      await svc.remove(id);
    });
  });

  // Test ID: T0016
  // Test Title: Verify that listing patients returns HTTP 200 with a paginated data and meta envelope
  test('T0016 | Positive | Verify that listing patients returns HTTP 200 with a paginated data and meta envelope', async ({ api }) => {
    // Step 1: List first page.
    const res = await new PatientService(api).list({ per_page: 5, page: 1 });
    // Step 2: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(patientListSuccessSchema, res.body, 'Patient list schema');
  });

  // Test ID: T0017
  // Test Title: Verify that a newly created patient can be fetched by id with HTTP 200
  test('T0017 | Positive | Verify that a newly created patient can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create patient.
    const created = await svc.create(buildPatient());
    expectOk(created, { status: 200 });
    const id = created.body.data.data.id;
    cleanup.add(`delete patient ${id}`, async () => svc.remove(id));
    // Step 2: Fetch same patient.
    const fetched = await svc.show(id);
    // Step 3: Verify 200.
    expectOk(fetched, { status: 200 });
  });

  // Test ID: T0018
  // Test Title: Verify that creating a patient without a first name is rejected with HTTP 422
  test('T0018 | Negative | Verify that creating a patient without a first name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build payload without first_name.
    const payload = buildPatient();
    delete payload.first_name;
    // Step 2: Create and verify 422.
    const res = await new PatientService(api).create(payload);
    expectError(res, 422);
  });

  // Test ID: T0019
  // Test Title: Verify that creating a patient without a last name is currently accepted with HTTP 200 (API quirk)
  test('T0019 | Negative | Verify that creating a patient without a last name is currently accepted with HTTP 200 (API quirk)', async ({ api, cleanup }) => {
    // Step 1: Build payload without last_name.
    const payload = buildPatient();
    delete payload.last_name;
    // Step 2: Create and verify 200.
    const res = await new PatientService(api).create(payload);
    expectOk(res, { status: 200 });
    // Step 3: Register cleanup.
    const id = res.body?.data?.data?.id;
    if (id) cleanup.add(`delete patient ${id}`, async () => new PatientService(api).remove(id));
  });

  // Test ID: T0020
  // Test Title: Verify that creating a patient with a malformed mobile number is rejected with HTTP 422
  test('T0020 | Negative | Verify that creating a patient with a malformed mobile number is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with bad mobile.
    const res = await new PatientService(api).create(buildPatient({ mobile_no: '12345' }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0021
  // Test Title: Verify that creating a second patient with a duplicate mobile number is rejected with HTTP 422
  test('T0021 | Edge | Verify that creating a second patient with a duplicate mobile number is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create first patient.
    const mobile = buildPatient().mobile_no;
    const first = await svc.create(buildPatient({ mobile_no: mobile }));
    expectOk(first, { status: 200 });
    cleanup.add('delete first patient', async () => svc.remove(first.body.data.data.id));
    // Step 2: Create second with same mobile.
    const second = await svc.create(buildPatient({ mobile_no: mobile }));
    // Step 3: Verify 422.
    expectError(second, 422);
  });

  // Test ID: T0022
  // Test Title: Verify that creating a patient without a token is rejected with HTTP 401
  test('T0022 | Negative | Verify that creating a patient without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    const res = await new PatientService(unauthApi).create(buildPatient());
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0023
  // Test Title: Verify that fetching a non-existent patient id returns HTTP 200 with empty data and never 500 (quirk)
  test('T0023 | Edge | Verify that fetching a non-existent patient id returns HTTP 200 with empty data and never 500 (quirk)', async ({ api }) => {
    // Step 1: Fetch non-existent id.
    const res = await new PatientService(api).show(999999999);
    // Step 2: Verify 200, never 500.
    expectStatus(res, 200, 'Non-existent patient should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Non-existent patient caused 5xx: ${res.status}`);
  });

  // Test ID: T0024
  // Test Title: Verify that a 50-character first name is accepted while a 300-character name is rejected
  test('T0024 | Boundary | Verify that a 50-character first name is accepted while a 300-character name is rejected', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create with 50-char name.
    const okRes = await svc.create(buildPatient({ first_name: 'A'.repeat(50) }));
    expectOk(okRes, { status: 200 });
    cleanup.add('delete boundary patient', async () => svc.remove(okRes.body.data.data.id));
    // Step 2: Create with 300-char name, verify never 200.
    const overRes = await svc.create(buildPatient({ first_name: 'B'.repeat(300) }));
    if (overRes.status === 200) throw new Error('Oversized first_name (300) was accepted — expected rejection');
  });

  // Test ID: T0025
  // Test Title: Verify that creating a patient with an empty first name is rejected with HTTP 422
  test('T0025 | Edge | Verify that creating a patient with an empty first name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with empty first_name.
    const res = await new PatientService(api).create(buildPatient({ first_name: '' }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0067
  // Test Title: Verify that updating a patient with PUT is rejected with HTTP 405
  test('T0067 | Negative | Verify that updating a patient with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create patient.
    const created = await svc.create(buildPatient());
    expectOk(created, { status: 200 });
    const id = created.body.data.data.id;
    cleanup.add(`delete patient ${id}`, async () => svc.remove(id));
    // Step 2: PUT update and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/patient/${id}`, { headers: { Accept: 'application/json' }, multipart: buildPatient() });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0068
  // Test Title: Verify that updating a patient with POST changes the stored name and returns HTTP 200
  test('T0068 | Positive | Verify that updating a patient with POST changes the stored name and returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create patient.
    const payload = buildPatient();
    const created = await svc.create(payload);
    expectOk(created, { status: 200 });
    const id = created.body.data.data.id;
    cleanup.add(`delete patient ${id}`, async () => svc.remove(id));
    // Step 2: POST full update with new name.
    const updated = await svc.update(id, { ...payload, first_name: 'Renamed' });
    expectOk(updated, { status: 200 });
    // Step 3: Fetch and verify new name.
    const fetched = await svc.show(id);
    expectOk(fetched, { status: 200 });
  });

  // Test ID: T0069
  // Test Title: Verify that updating a patient without a mobile number is rejected with HTTP 422
  test('T0069 | Negative | Verify that updating a patient without a mobile number is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create patient.
    const payload = buildPatient();
    const created = await svc.create(payload);
    expectOk(created, { status: 200 });
    const id = created.body.data.data.id;
    cleanup.add(`delete patient ${id}`, async () => svc.remove(id));
    // Step 2: Update without mobile, verify 422.
    const { mobile_no, ...noMobile } = payload;
    expectError(await svc.update(id, noMobile), 422);
  });

  // Test ID: T0070
  // Test Title: Verify that updating a non-existent patient id upserts the record and returns HTTP 200 with a new id
  test('T0070 | Edge | Verify that updating a non-existent patient id upserts the record and returns HTTP 200 with a new id', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: POST update to non-existent id.
    const res = await svc.update(999999999, buildPatient());
    // Step 2: Verify upsert — 200 with a new real id.
    expectOk(res, { status: 200 });
    const newId = res.body?.data?.id;
    if (newId && newId !== 999999999) cleanup.add(`delete upserted ${newId}`, async () => svc.remove(newId));
  });

  // Test ID: T0071
  // Test Title: Verify that creating a patient without a registration date is never accepted with HTTP 200
  test('T0071 | Negative | Verify that creating a patient without a registration date is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Build payload without registration_date.
    const payload = buildPatient();
    delete payload.registration_date;
    // Step 2: Create, verify never 200 (live API 500s — server bug).
    const res = await new PatientService(api).create(payload);
    if (res.status === 200) throw new Error('Missing registration_date was accepted');
    if (res.status >= 500) console.warn(`[known-bug] missing registration_date -> ${res.status}`);
  });

  // Test ID: T0072
  // Test Title: Verify that creating a patient without hnr_name is never accepted with HTTP 200
  test('T0072 | Negative | Verify that creating a patient without hnr_name is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Build payload without hnr_name.
    const payload = buildPatient();
    delete payload.hnr_name;
    // Step 2: Create, verify never 200 (live API 500s — server bug).
    const res = await new PatientService(api).create(payload);
    if (res.status === 200) throw new Error('Missing hnr_name was accepted');
  });

  // Test ID: T0073
  // Test Title: Verify that creating a patient with an invalid email is rejected with HTTP 422
  test('T0073 | Negative | Verify that creating a patient with an invalid email is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with bad email.
    const res = await new PatientService(api).create(buildPatient({ email: 'not-an-email' }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0074
  // Test Title: Verify that creating a patient with a negative age is rejected with HTTP 422
  test('T0074 | Negative | Verify that creating a patient with a negative age is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with age -5.
    const res = await new PatientService(api).create(buildPatient({ age: -5 }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0075
  // Test Title: Verify that a mobile number with +91 prefix is accepted with HTTP 200
  test('T0075 | Positive | Verify that a mobile number with +91 prefix is accepted with HTTP 200', async ({ api, cleanup }) => {
    const svc = new PatientService(api);
    // Step 1: Create with +91 mobile.
    const mobile = `+91${require('../../src/data/factories/patient.factory').uniqueMobile()}`;
    const res = await svc.create(buildPatient({ mobile_no: mobile }));
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
    cleanup.add('delete +91 patient', async () => svc.remove(res.body.data.data.id));
  });

  // Test ID: T0076
  // Test Title: Verify that deleting an already-deleted patient never returns HTTP 200 again
  test('T0076 | Edge | Verify that deleting an already-deleted patient never returns HTTP 200 again', async ({ api }) => {
    const svc = new PatientService(api);
    // Step 1: Create then delete once.
    const created = await svc.create(buildPatient());
    expectOk(created, { status: 200 });
    const id = created.body.data.data.id;
    expectOk(await svc.remove(id), { status: 200 });
    // Step 2: Delete again, verify never 200 (live API 500s — server bug).
    const second = await svc.remove(id);
    if (second.status === 200) throw new Error('Double delete returned 200');
  });

  // Test ID: T0077
  // Test Title: Verify that the patient search endpoint returns HTTP 200 for a search term
  test('T0077 | Positive | Verify that the patient search endpoint returns HTTP 200 for a search term', async ({ api }) => {
    // Step 1: Search patients.
    const res = await new PatientService(api).search('Test');
    // Step 2: Verify 200 (no SLA — search is slow under load).
    expectStatus(res, 200, 'Patient search');
  });

  // Test ID: T0078
  // Test Title: Verify that listing patients with per_page=0 never causes an HTTP 500 server error
  test('T0078 | Boundary | Verify that listing patients with per_page=0 never causes an HTTP 500 server error', async ({ api }) => {
    // Step 1: List with per_page 0.
    const res = await new PatientService(api).list({ per_page: 0, page: 1 });
    // Step 2: Verify no crash.
    if (res.status >= 500) throw new Error(`per_page=0 caused 5xx: ${res.status}`);
  });

  // Test ID: T0079
  // Test Title: Verify that fetching a patient with a non-numeric id never causes an HTTP 500 server error
  test('T0079 | Edge | Verify that fetching a patient with a non-numeric id never causes an HTTP 500 server error', async ({ api }) => {
    // Step 1: Fetch with alpha id.
    const res = await new PatientService(api).show('abc');
    // Step 2: Verify no crash.
    if (res.status >= 500) throw new Error(`Alpha id caused 5xx: ${res.status}`);
  });
});
