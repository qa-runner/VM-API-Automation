// Suite: Clinical masters (symptoms, diagnosis, departments)
const { test } = require('../../src/fixtures/api.fixture');
const { ClinicalService } = require('../../src/services/clinical.service');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');
const { faker } = require('@faker-js/faker');

function uniq(prefix) {
  return `${prefix}-${faker.number.int({ min: 1000, max: 9999 })}`;
}

/** Departments return no id on create — locate via list by name. */
async function findDepartmentId(api, name) {
  const res = await new ClinicalService(api).listDepartments();
  if (res.status !== 200 || !Array.isArray(res.body?.data)) return null;
  return res.body.data.find((d) => d.name === name)?.id || null;
}

test.describe('Clinical masters', () => {
  // Test ID: T0291
  // Test Title: Verify that creating a symptom returns HTTP 201 with an id
  test('T0291 | Positive | Verify that creating a symptom returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create symptom.
    const res = await svc.createSymptom({ name: uniq('Symp') });
    // Step 2: Verify 201 + cleanup.
    expectOk(res, { status: 201 });
    cleanup.add(`delete symptom ${res.body.data.id}`, async () => svc.removeSymptom(res.body.data.id));
  });

  // Test ID: T0292
  // Test Title: Verify that listing symptoms returns HTTP 200
  test('T0292 | Positive | Verify that listing symptoms returns HTTP 200', async ({ api }) => {
    // Step 1: List symptoms.
    expectOk(await new ClinicalService(api).listSymptoms(), { status: 200 });
  });

  // Test ID: T0293
  // Test Title: Verify that a newly created symptom can be fetched by id with HTTP 200
  test('T0293 | Positive | Verify that a newly created symptom can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create symptom.
    const created = await svc.createSymptom({ name: uniq('Symp') });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete symptom ${id}`, async () => svc.removeSymptom(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showSymptom(id), { status: 200 });
  });

  // Test ID: T0294
  // Test Title: Verify that fetching a non-existent symptom returns HTTP 404
  test('T0294 | Edge | Verify that fetching a non-existent symptom returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new ClinicalService(api).showSymptom(999999999), 404);
  });

  // Test ID: T0295
  // Test Title: Verify that updating a symptom with POST returns HTTP 200
  test('T0295 | Positive | Verify that updating a symptom with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create symptom.
    const created = await svc.createSymptom({ name: uniq('Symp') });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete symptom ${id}`, async () => svc.removeSymptom(id));
    // Step 2: POST update.
    expectOk(await svc.updateSymptom(id, { name: uniq('SympU') }), { status: 200 });
  });

  // Test ID: T0296
  // Test Title: Verify that updating a symptom with PUT is rejected with HTTP 405
  test('T0296 | Negative | Verify that updating a symptom with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create symptom.
    const created = await svc.createSymptom({ name: uniq('Symp') });
    expectOk(created, { status: 201 });
    const id = created.body.data.id;
    cleanup.add(`delete symptom ${id}`, async () => svc.removeSymptom(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/symptoms/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0297
  // Test Title: Verify that creating a symptom without a name is rejected with HTTP 422
  test('T0297 | Negative | Verify that creating a symptom without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new ClinicalService(api).createSymptom({}), 422);
  });

  // Test ID: T0298
  // Test Title: Verify that symptoms without a token are rejected with HTTP 401
  test('T0298 | Negative | Verify that symptoms without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new ClinicalService(unauthApi).listSymptoms(), 401);
  });

  // Test ID: T0299
  // Test Title: Verify that creating a diagnosis returns HTTP 200 with an id
  test('T0299 | Positive | Verify that creating a diagnosis returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create diagnosis.
    const res = await svc.createDiagnosis({ name: uniq('Diag') });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete diagnosis ${res.body.data.id}`, async () => svc.removeDiagnosis(res.body.data.id));
  });

  // Test ID: T0300
  // Test Title: Verify that listing diagnosis records returns HTTP 200
  test('T0300 | Positive | Verify that listing diagnosis records returns HTTP 200', async ({ api }) => {
    // Step 1: List diagnosis.
    expectOk(await new ClinicalService(api).listDiagnosis(), { status: 200 });
  });

  // Test ID: T0301
  // Test Title: Verify that a newly created diagnosis can be fetched by id with HTTP 200
  test('T0301 | Positive | Verify that a newly created diagnosis can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create diagnosis.
    const created = await svc.createDiagnosis({ name: uniq('Diag') });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete diagnosis ${id}`, async () => svc.removeDiagnosis(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showDiagnosis(id), { status: 200 });
  });

  // Test ID: T0302
  // Test Title: Verify that fetching a non-existent diagnosis returns HTTP 200 quirk and never 500
  test('T0302 | Edge | Verify that fetching a non-existent diagnosis returns HTTP 200 quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new ClinicalService(api).showDiagnosis(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing diagnosis should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0303
  // Test Title: Verify that creating a diagnosis without a name is rejected with HTTP 422
  test('T0303 | Negative | Verify that creating a diagnosis without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new ClinicalService(api).createDiagnosis({}), 422);
  });

  // Test ID: T0304
  // Test Title: Verify that a diagnosis can be created and deleted with HTTP 200
  test('T0304 | Positive | Verify that a diagnosis can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create diagnosis.
    const created = await svc.createDiagnosis({ name: uniq('Diag') });
    expectOk(created, { status: 200 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeDiagnosis(created.body.data.id), { status: 200 });
  });

  // Test ID: T0305
  // Test Title: Verify that creating a department returns HTTP 201
  test('T0305 | Positive | Verify that creating a department returns HTTP 201', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create department (no id in response — locate via list).
    const name = uniq('Dept');
    expectOk(await svc.createDepartment({ name }), { status: 201 });
    const id = await findDepartmentId(api, name);
    cleanup.add(`delete dept ${id}`, async () => svc.removeDepartment(id));
  });

  // Test ID: T0306
  // Test Title: Verify that listing departments returns HTTP 200
  test('T0306 | Positive | Verify that listing departments returns HTTP 200', async ({ api }) => {
    // Step 1: List departments.
    expectOk(await new ClinicalService(api).listDepartments(), { status: 200 });
  });

  // Test ID: T0307
  // Test Title: Verify that a newly created department can be fetched by id with HTTP 200
  test('T0307 | Positive | Verify that a newly created department can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create + locate.
    const name = uniq('Dept');
    expectOk(await svc.createDepartment({ name }), { status: 201 });
    const id = await findDepartmentId(api, name);
    cleanup.add(`delete dept ${id}`, async () => svc.removeDepartment(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showDepartment(id), { status: 200 });
  });

  // Test ID: T0308
  // Test Title: Verify that fetching a non-existent department returns HTTP 200 quirk and never 500
  test('T0308 | Edge | Verify that fetching a non-existent department returns HTTP 200 quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new ClinicalService(api).showDepartment(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing department should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0309
  // Test Title: Verify that updating a department with POST returns HTTP 200
  test('T0309 | Positive | Verify that updating a department with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create + locate.
    const name = uniq('Dept');
    expectOk(await svc.createDepartment({ name }), { status: 201 });
    const id = await findDepartmentId(api, name);
    cleanup.add(`delete dept ${id}`, async () => svc.removeDepartment(id));
    // Step 2: POST update.
    expectOk(await svc.updateDepartment(id, { name: uniq('DeptU') }), { status: 200 });
  });

  // Test ID: T0310
  // Test Title: Verify that updating a department with PUT is rejected with HTTP 405
  test('T0310 | Negative | Verify that updating a department with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create + locate.
    const name = uniq('Dept');
    expectOk(await svc.createDepartment({ name }), { status: 201 });
    const id = await findDepartmentId(api, name);
    cleanup.add(`delete dept ${id}`, async () => svc.removeDepartment(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/consultation-department/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0311
  // Test Title: Verify that a department can be created and deleted with HTTP 200
  test('T0311 | Positive | Verify that a department can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create + locate.
    const name = uniq('Dept');
    expectOk(await svc.createDepartment({ name }), { status: 201 });
    const id = await findDepartmentId(api, name);
    // Step 2: Delete returns 200.
    expectOk(await svc.removeDepartment(id), { status: 200 });
  });

  // Test ID: T0312
  // Test Title: Verify that departments without a token are rejected with HTTP 401
  test('T0312 | Negative | Verify that departments without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new ClinicalService(unauthApi).listDepartments(), 401);
  });

  // Test ID: T0332
  // Test Title: Verify that creating a modern diagnosis returns HTTP 200 with an id
  test('T0332 | Positive | Verify that creating a modern diagnosis returns HTTP 200 with an id', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern diagnosis.
    const res = await svc.createModernDiagnosis({ name: `MDx-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete mdx ${res.body.data.id}`, async () => svc.removeModernDiagnosis(res.body.data.id));
  });

  // Test ID: T0333
  // Test Title: Verify that listing modern diagnosis records returns HTTP 200
  test('T0333 | Positive | Verify that listing modern diagnosis records returns HTTP 200', async ({ api }) => {
    // Step 1: List modern diagnosis.
    expectOk(await new ClinicalService(api).listModernDiagnosis(), { status: 200 });
  });

  // Test ID: T0334
  // Test Title: Verify that a newly created modern diagnosis can be fetched by id with HTTP 200
  test('T0334 | Positive | Verify that a newly created modern diagnosis can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern diagnosis.
    const created = await svc.createModernDiagnosis({ name: `MDx-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mdx ${id}`, async () => svc.removeModernDiagnosis(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showModernDiagnosis(id), { status: 200 });
  });

  // Test ID: T0335
  // Test Title: Verify that fetching a non-existent modern diagnosis returns HTTP 200 quirk and never 500
  test('T0335 | Edge | Verify that fetching a non-existent modern diagnosis returns HTTP 200 quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new ClinicalService(api).showModernDiagnosis(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing modern diagnosis should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0336
  // Test Title: Verify that updating a modern diagnosis with POST returns HTTP 200
  test('T0336 | Positive | Verify that updating a modern diagnosis with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern diagnosis.
    const created = await svc.createModernDiagnosis({ name: `MDx-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mdx ${id}`, async () => svc.removeModernDiagnosis(id));
    // Step 2: POST update.
    expectOk(await svc.updateModernDiagnosis(id, { name: `MDxU-${faker.number.int({ min: 1000, max: 9999 })}` }), { status: 200 });
  });

  // Test ID: T0337
  // Test Title: Verify that updating a modern diagnosis with PUT is rejected with HTTP 405
  test('T0337 | Negative | Verify that updating a modern diagnosis with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern diagnosis.
    const created = await svc.createModernDiagnosis({ name: `MDx-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete mdx ${id}`, async () => svc.removeModernDiagnosis(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/modern-diagnosis/${id}`, { headers: { Accept: 'application/json' }, data: { name: 'X' } });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0338
  // Test Title: Verify that creating a modern diagnosis without a name is rejected with HTTP 422
  test('T0338 | Negative | Verify that creating a modern diagnosis without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    expectError(await new ClinicalService(api).createModernDiagnosis({}), 422);
  });

  // Test ID: T0339
  // Test Title: Verify that a modern diagnosis can be created and deleted with HTTP 200
  test('T0339 | Positive | Verify that a modern diagnosis can be created and deleted with HTTP 200', async ({ api }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern diagnosis.
    const created = await svc.createModernDiagnosis({ name: `MDx-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectOk(created, { status: 200 });
    // Step 2: Delete returns 200.
    expectOk(await svc.removeModernDiagnosis(created.body.data.id), { status: 200 });
  });

  // Test ID: T0340
  // Test Title: Verify that creating a modern system returns HTTP 201 with an id
  test('T0340 | Positive | Verify that creating a modern system returns HTTP 201 with an id', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern system (bare {data} body, no success envelope — quirk).
    const res = await svc.createModernSystem({ name: `MSys-${faker.number.int({ min: 1000, max: 9999 })}` });
    // Step 2: Verify 200 + id + cleanup.
    expectStatus(res, 201, 'Modern system create');
    if (!res.body?.data?.id) throw new Error('Create response has no data.id');
    cleanup.add(`delete msys ${res.body.data.id}`, async () => svc.removeModernSystem(res.body.data.id));
  });

  // Test ID: T0341
  // Test Title: Verify that listing modern systems returns HTTP 200
  test('T0341 | Positive | Verify that listing modern systems returns HTTP 200', async ({ api }) => {
    // Step 1: List modern systems.
    expectOk(await new ClinicalService(api).listModernSystems(), { status: 200 });
  });

  // Test ID: T0342
  // Test Title: Verify that a newly created modern system can be fetched by id with HTTP 200
  test('T0342 | Positive | Verify that a newly created modern system can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern system (bare body quirk).
    const created = await svc.createModernSystem({ name: `MSys-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectStatus(created, 201, 'Modern system create');
    const id = created.body.data.id;
    cleanup.add(`delete msys ${id}`, async () => svc.removeModernSystem(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showModernSystem(id), { status: 200 });
  });

  // Test ID: T0343
  // Test Title: Verify that fetching a non-existent modern system returns HTTP 201 quirk and never 500
  test('T0343 | Edge | Verify that fetching a non-existent modern system returns HTTP 201 quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new ClinicalService(api).showModernSystem(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing modern system should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0344
  // Test Title: Verify that a modern system can be created and deleted with HTTP 201
  test('T0344 | Positive | Verify that a modern system can be created and deleted with HTTP 201', async ({ api }) => {
    const svc = new ClinicalService(api);
    // Step 1: Create modern system (bare body quirk).
    const created = await svc.createModernSystem({ name: `MSys-${faker.number.int({ min: 1000, max: 9999 })}` });
    expectStatus(created, 201, 'Modern system create');
    // Step 2: Delete returns 200.
    expectOk(await svc.removeModernSystem(created.body.data.id), { status: 200 });
  });

  // Test ID: T0345
  // Test Title: Verify that modern masters without a token are rejected with HTTP 401
  test('T0345 | Negative | Verify that modern masters without a token are rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new ClinicalService(unauthApi).listModernDiagnosis(), 401);
  });
});
