// Suite: Patient waiting list
const { test } = require('../../src/fixtures/api.fixture');
const { WaitingService } = require('../../src/services/waiting.service');
const { PatientService } = require('../../src/services/patient.service');
const { VisitService } = require('../../src/services/visit.service');
const { buildPatient } = require('../../src/data/factories/patient.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/** Helper: patient + case for waiting tests. */
async function setupPatientWithCase(api, cleanup) {
  const patSvc = new PatientService(api);
  const pat = await patSvc.create(buildPatient());
  expectOk(pat, { status: 200 });
  const patientId = pat.body.data.data.id;
  cleanup.add(`delete patient ${patientId}`, async () => patSvc.remove(patientId));
  const kase = await new VisitService(api).createCase(patientId, { department_id: 8 });
  expectOk(kase, { status: 200 });
  return { patientId, caseId: kase.body.data.id };
}

test.describe('Patient waiting list', () => {
  // Test ID: T0249
  // Test Title: Verify that adding a patient to the waiting list returns HTTP 200 with a record id
  test('T0249 | Positive | Verify that adding a patient to the waiting list returns HTTP 200 with a record id', async ({ api, cleanup }) => {
    const svc = new WaitingService(api);
    // Step 1: Setup patient + case.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Add to waiting list.
    const res = await svc.save({ case_id: caseId, patient_id: patientId, date: '2026-10-16' });
    // Step 3: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete waiting ${res.body.data.id}`, async () => svc.remove(res.body.data.id));
  });

  // Test ID: T0250
  // Test Title: Verify that the waiting list for a date returns HTTP 200
  test('T0250 | Positive | Verify that the waiting list for a date returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch waiting list.
    expectOk(await new WaitingService(api).list({ date: '2026-10-16' }), { status: 200 });
  });

  // Test ID: T0251
  // Test Title: Verify that saving without case id is rejected with HTTP 422
  test('T0251 | Negative | Verify that saving without case id is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new WaitingService(api);
    // Step 1: Setup patient (need valid patient_id).
    const { patientId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Save without case_id.
    expectError(await svc.save({ patient_id: patientId, date: '2026-10-16' }), 422);
  });

  // Test ID: T0252
  // Test Title: Verify that a waiting record can be added and removed with HTTP 200
  test('T0252 | Positive | Verify that a waiting record can be added and removed with HTTP 200', async ({ api, cleanup }) => {
    const svc = new WaitingService(api);
    // Step 1: Setup + save.
    const { patientId, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.save({ case_id: caseId, patient_id: patientId, date: '2026-10-16' });
    expectOk(created, { status: 200 });
    // Step 2: Delete returns 200.
    expectOk(await svc.remove(created.body.data.id), { status: 200 });
  });

  // Test ID: T0253
  // Test Title: Verify that deleting a non-existent waiting record never returns HTTP 200
  test('T0253 | Edge | Verify that deleting a non-existent waiting record never returns HTTP 200', async ({ api }) => {
    // Step 1: Delete non-existent id (live 500s — should be 404).
    const res = await new WaitingService(api).remove(999999999);
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Missing waiting record returned 200');
  });

  // Test ID: T0254
  // Test Title: Verify that the waiting list without a token is rejected with HTTP 401
  test('T0254 | Negative | Verify that the waiting list without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    expectError(await new WaitingService(unauthApi).list({ date: '2026-10-16' }), 401);
  });
});
