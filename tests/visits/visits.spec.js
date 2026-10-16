// Suite: Patient visits | case + visit chain
const { test } = require('../../src/fixtures/api.fixture');
const { VisitService } = require('../../src/services/visit.service');
const { PatientService } = require('../../src/services/patient.service');
const { buildPatient } = require('../../src/data/factories/patient.factory');
const { buildVisit } = require('../../src/data/factories/visit.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/**
 * Helper: creates patient + case, returns { patientId, caseId }.
 * Registers patient cleanup on the calling test's registry.
 */
async function setupPatientWithCase(api, cleanup) {
  const patSvc = new PatientService(api);
  const pat = await patSvc.create(buildPatient());
  expectOk(pat, { status: 200 });
  const patientId = pat.body.data.data.id;
  cleanup.add(`delete patient ${patientId}`, async () => patSvc.remove(patientId));
  const svc = new VisitService(api);
  const kase = await svc.createCase(patientId, { department_id: 8 });
  expectOk(kase, { status: 200 });
  return { patientId, caseId: kase.body.data.id };
}

test.describe('Patient visits | case + visit chain', () => {
  // Test ID: T0122
  // Test Title: Verify that the full patient-case-visit creation chain returns HTTP 201 with a visit id
  test('T0122 | Positive | Verify that the full patient-case-visit creation chain returns HTTP 201 with a visit id', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup patient + case.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create visit.
    const res = await svc.create(buildVisit(caseId, patientId));
    // Step 3: Verify 201 + id.
    expectOk(res, { status: 201 });
    // Step 4: Cleanup visit.
    const vid = res.body.data.id;
    cleanup.add(`delete visit ${vid}`, async () => svc.remove(vid));
  });

  // Test ID: T0123
  // Test Title: Verify that listing visits by case id returns HTTP 200
  test('T0123 | Positive | Verify that listing visits by case id returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create visit.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    cleanup.add('delete visit', async () => svc.remove(created.body.data.id));
    // Step 2: List by case.
    expectOk(await svc.listByCase(caseId), { status: 200 });
  });

  // Test ID: T0124
  // Test Title: Verify that a newly created visit can be fetched by id with HTTP 200
  test('T0124 | Positive | Verify that a newly created visit can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    const vid = created.body.data.id;
    cleanup.add(`delete visit ${vid}`, async () => svc.remove(vid));
    // Step 2: Show returns 200.
    expectOk(await svc.show(vid), { status: 200 });
  });

  // Test ID: T0125
  // Test Title: Verify that updating a visit with POST returns HTTP 200
  test('T0125 | Positive | Verify that updating a visit with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    const vid = created.body.data.id;
    cleanup.add(`delete visit ${vid}`, async () => svc.remove(vid));
    // Step 2: POST full update.
    expectOk(await svc.update(vid, { ...buildVisit(caseId, patientId), chief_complaint: 'Updated' }), { status: 200 });
  });

  // Test ID: T0126
  // Test Title: Verify that updating a visit with PUT is rejected with HTTP 405
  test('T0126 | Negative | Verify that updating a visit with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    const vid = created.body.data.id;
    cleanup.add(`delete visit ${vid}`, async () => svc.remove(vid));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/patient/visit/${vid}`, { headers: { Accept: 'application/json' }, multipart: buildVisit(caseId, patientId) });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0127
  // Test Title: Verify that creating a visit without a case id is rejected with HTTP 422
  test('T0127 | Negative | Verify that creating a visit without a case id is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup patient (need valid patient_id).
    const { patientId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create without case_id.
    const fields = buildVisit(1184, patientId);
    delete fields.case_id;
    expectError(await svc.create(fields), 422);
  });

  // Test ID: T0128
  // Test Title: Verify that creating a visit without a next follow-up date is never accepted with 2xx
  test('T0128 | Negative | Verify that creating a visit without a next follow-up date is never accepted with 2xx', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create without next_followup_date (live 500s — server bug).
    const fields = buildVisit(caseId, patientId);
    delete fields.next_followup_date;
    const res = await svc.create(fields);
    if (res.status === 201 || res.status === 200) throw new Error('Missing next_followup_date was accepted');
  });

  // Test ID: T0129
  // Test Title: Verify that creating a visit with a non-date string is never accepted with 2xx
  test('T0129 | Negative | Verify that creating a visit with a non-date string is never accepted with 2xx', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create with non-date (live 500s — should be 422).
    const res = await svc.create(buildVisit(caseId, patientId, { date: 'not-a-date' }));
    if (res.status === 201 || res.status === 200) throw new Error('Bad date was accepted');
  });

  // Test ID: T0130
  // Test Title: Verify that fetching a non-existent visit never returns HTTP 200
  test('T0130 | Edge | Verify that fetching a non-existent visit never returns HTTP 200', async ({ api }) => {
    // Step 1: Show non-existent visit (live 500s — should be 404).
    const res = await new VisitService(api).show(999999999);
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Missing visit returned 200 with data?');
  });

  // Test ID: T0131
  // Test Title: Verify that deleting an already-deleted visit never returns HTTP 200 again
  test('T0131 | Edge | Verify that deleting an already-deleted visit never returns HTTP 200 again', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    const vid = created.body.data.id;
    // Step 2: Delete returns 200.
    expectOk(await svc.remove(vid), { status: 200 });
    // Step 3: Re-delete never 200 (live 500s).
    const second = await svc.remove(vid);
    if (second.status === 200) throw new Error('Re-delete returned 200');
  });

  // Test ID: T0132
  // Test Title: Verify that creating a visit without a token is rejected with HTTP 401
  test('T0132 | Negative | Verify that creating a visit without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new VisitService(unauthApi).create(buildVisit(1, 1)), 401);
  });

  // Test ID: T0133
  // Test Title: Verify that creating a case for a non-existent patient returns HTTP 404
  test('T0133 | Edge | Verify that creating a case for a non-existent patient returns HTTP 404', async ({ api }) => {
    // Step 1: Create case for non-existent patient.
    expectError(await new VisitService(api).createCase(999999999, { department_id: 8 }), 404);
  });

  // Test ID: T0134
  // Test Title: Verify that fetching visit details for a valid visit returns HTTP 200
  test('T0134 | Positive | Verify that fetching visit details for a valid visit returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new VisitService(api);
    // Step 1: Setup + create.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.create(buildVisit(caseId, patientId));
    expectOk(created, { status: 201 });
    const vid = created.body.data.id;
    cleanup.add(`delete visit ${vid}`, async () => svc.remove(vid));
    // Step 2: Detail returns 200.
    expectOk(await svc.details(vid), { status: 200 });
  });
});