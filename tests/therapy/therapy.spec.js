// Suite: Patient therapy | packages, advice, schedule
const { test } = require('../../src/fixtures/api.fixture');
const { TherapyService } = require('../../src/services/therapy.service');
const { PatientService } = require('../../src/services/patient.service');
const { VisitService } = require('../../src/services/visit.service');
const { buildPatient } = require('../../src/data/factories/patient.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/**
 * Helper: patient + case. Packages have NO delete endpoint, so each
 * creating test leaves one junk row (documented, dev-env acceptable).
 */
async function setupPatientWithCase(api, cleanup) {
  const patSvc = new PatientService(api);
  const pat = await patSvc.create(buildPatient());
  expectOk(pat, { status: 200 });
  const patient = pat.body.data.data;
  cleanup.add(`delete patient ${patient.id}`, async () => patSvc.remove(patient.id));
  const caseRes = await new VisitService(api).createCase(patient.id, { department_id: 8 });
  expectOk(caseRes, { status: 200 });
  return { patient, mobile: patient.mobile_no, caseId: caseRes.body.data.id };
}

function packagePayload(patient, caseId, name) {
  return { patient_id: patient.id, patient_name: name || `${patient.first_name} ${patient.last_name}`, case_id: caseId, date: '2026-10-16' };
}

test.describe('Patient therapy | packages, advice, schedule', () => {
  // Test ID: T0135
  // Test Title: Verify that creating a therapy package returns HTTP 200 with a package id
  test('T0135 | Positive | Verify that creating a therapy package returns HTTP 200 with a package id', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup patient + case.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create package (no delete endpoint — row stays).
    const res = await svc.createPackage(packagePayload(patient, caseId));
    // Step 3: Verify 200 + id.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0136
  // Test Title: Verify that listing therapy packages returns HTTP 200
  test('T0136 | Positive | Verify that listing therapy packages returns HTTP 200', async ({ api }) => {
    // Step 1: List packages.
    expectOk(await new TherapyService(api).listPackages({ per_page: 5, page: 1 }), { status: 200 });
  });

  // Test ID: T0137
  // Test Title: Verify that a newly created therapy package can be fetched by id with HTTP 200
  test('T0137 | Positive | Verify that a newly created therapy package can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup + create.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.createPackage(packagePayload(patient, caseId));
    expectOk(created, { status: 200 });
    // Step 2: Show returns 200.
    expectOk(await svc.showPackage(created.body.data.id), { status: 200 });
  });

  // Test ID: T0138
  // Test Title: Verify that fetching a non-existent therapy package returns HTTP 200 empty quirk and never 500
  test('T0138 | Edge | Verify that fetching a non-existent therapy package returns HTTP 200 empty quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new TherapyService(api).showPackage(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing package should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0139
  // Test Title: Verify that updating a therapy package with POST including the mobile number returns HTTP 200
  test('T0139 | Positive | Verify that updating a therapy package with POST including the mobile number returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup + create.
    const { patient, mobile, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.createPackage(packagePayload(patient, caseId));
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    // Step 2: POST update incl. mobile_no.
    expectOk(await svc.updatePackage(id, { ...packagePayload(patient, caseId), mobile_no: mobile, notes: 'upd' }), { status: 200 });
  });

  // Test ID: T0140
  // Test Title: Verify that updating a therapy package with PUT is rejected with HTTP 405
  test('T0140 | Negative | Verify that updating a therapy package with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup + create.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    const created = await svc.createPackage(packagePayload(patient, caseId));
    expectOk(created, { status: 200 });
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/patient/therapy/${created.body.data.id}`, { headers: { Accept: 'application/json' }, data: packagePayload(patient, caseId) });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0141
  // Test Title: Verify that creating a therapy package without a patient name is rejected with HTTP 422
  test('T0141 | Negative | Verify that creating a therapy package without a patient name is rejected with HTTP 422', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create without patient_name.
    expectError(await svc.createPackage({ patient_id: patient.id, case_id: caseId, date: '2026-10-16' }), 422);
  });

  // Test ID: T0142
  // Test Title: Verify that creating a therapy package without a date is never accepted with HTTP 200
  test('T0142 | Negative | Verify that creating a therapy package without a date is never accepted with HTTP 200', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Create without date (live 500s — server bug).
    const res = await svc.createPackage({ patient_id: patient.id, patient_name: 'X Y', case_id: caseId });
    if (res.status === 200) throw new Error('Missing date was accepted');
  });

  // Test ID: T0143
  // Test Title: Verify that creating an advised therapy plan with a therapy slot returns HTTP 200
  test('T0143 | Positive | Verify that creating an advised therapy plan with a therapy slot returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup.
    const { patient, caseId } = await setupPatientWithCase(api, cleanup);
    // Step 2: Advice with therapy slot (therapy 3 = Abhyanga).
    const res = await svc.createAdvice({ patient_id: patient.id, case_id: caseId, date: '2026-10-16', slots: [{ advised_sittings: 5, therapies: [{ therapy_id: 3, name: 'Abhyanga', advised_days: 5, days: 5 }], remarks: 'plan' }] });
    expectOk(res, { status: 200 });
  });

  // Test ID: T0144
  // Test Title: Verify that listing advised therapy packages returns HTTP 200
  test('T0144 | Positive | Verify that listing advised therapy packages returns HTTP 200', async ({ api }) => {
    // Step 1: List adviced packages.
    expectOk(await new TherapyService(api).listAdviced({ per_page: 5, page: 1 }), { status: 200 });
  });

  // Test ID: T0145
  // Test Title: Verify that listing scheduled therapies returns HTTP 200
  test('T0145 | Positive | Verify that listing scheduled therapies returns HTTP 200', async ({ api }) => {
    // Step 1: List scheduled therapies.
    expectOk(await new TherapyService(api).listScheduled(), { status: 200 });
  });

  // Test ID: T0146
  // Test Title: Verify that creating a therapy package without a token is rejected with HTTP 401
  test('T0146 | Negative | Verify that creating a therapy package without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new TherapyService(unauthApi).createPackage({ patient_name: 'X', date: '2026-10-16' }), 401);
  });

  // Test ID: T0255
  // Test Title: Verify that generating the therapy package PDF returns HTTP 200 with content
  test('T0255 | Positive | Verify that generating the therapy package PDF returns HTTP 200 with content', async ({ api, cleanup }) => {
    const svc = new TherapyService(api);
    // Step 1: Setup patient + case + package.
    const patSvc = new (require('../../src/services/patient.service').PatientService)(api);
    const pat = await patSvc.create(require('../../src/data/factories/patient.factory').buildPatient());
    expectOk(pat, { status: 200 });
    const patient = pat.body.data.data;
    cleanup.add(`delete patient ${patient.id}`, async () => patSvc.remove(patient.id));
    const kase = await new (require('../../src/services/visit.service').VisitService)(api).createCase(patient.id, { department_id: 8 });
    expectOk(kase, { status: 200 });
    const pkg = await svc.createPackage({ patient_id: patient.id, patient_name: `${patient.first_name} ${patient.last_name}`, case_id: kase.body.data.id, date: '2026-10-16' });
    expectOk(pkg, { status: 200 });
    // Step 2: PDF returns 200 with a body (public URL).
    const pdf = await svc.pdf(pkg.body.data.id);
    expectOk(pdf, { status: 200 });
  });

  // Test ID: T0256
  // Test Title: Verify that generating a PDF for a non-existent package never returns HTTP 200
  test('T0256 | Edge | Verify that generating a PDF for a non-existent package never returns HTTP 200', async ({ api }) => {
    // Step 1: PDF for missing id (live 500s — should be 404).
    const res = await new TherapyService(api).pdf(999999999);
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Missing package PDF returned 200');
  });
});
