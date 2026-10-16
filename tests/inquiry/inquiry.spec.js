// Suite: Inquiry | create, list, show, update
const { test } = require('../../src/fixtures/api.fixture');
const { InquiryService } = require('../../src/services/inquiry.service');
const { buildInquiry } = require('../../src/data/factories/inquiry.factory');
const { expectOk, expectError, expectSchema } = require('../../src/utils/assertions');
const { inquiryCreateSuccessSchema, inquiryListSuccessSchema } = require('../../src/schemas/billing.schema');

test.describe('Inquiry | create, list, show, update', () => {
  // Test ID: T0041
  // Test Title: Verify that creating an inquiry with valid date, name and phone returns HTTP 200 with an id
  test('T0041 | Positive | Verify that creating an inquiry with valid date, name and phone returns HTTP 200 with an id', async ({ api }) => {
    // Step 1: Build valid payload.
    const payload = buildInquiry();
    // Step 2: Create inquiry.
    const res = await new InquiryService(api).create(payload);
    // Step 3: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(inquiryCreateSuccessSchema, res.body, 'Inquiry create schema');
  });

  // Test ID: T0042
  // Test Title: Verify that listing inquiries returns HTTP 200 with a paginated envelope
  test('T0042 | Positive | Verify that listing inquiries returns HTTP 200 with a paginated envelope', async ({ api }) => {
    // Step 1: List first page.
    const res = await new InquiryService(api).list({ page: 1, per_page: 5 });
    // Step 2: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(inquiryListSuccessSchema, res.body, 'Inquiry list schema');
  });

  // Test ID: T0043
  // Test Title: Verify that a newly created inquiry can be fetched and updated with HTTP 200
  test('T0043 | Positive | Verify that a newly created inquiry can be fetched and updated with HTTP 200', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    // Step 2: Fetch it back.
    const fetched = await svc.show(id);
    expectOk(fetched, { status: 200 });
    // Step 3: Update remark.
    const updated = await svc.update(id, { date: created.body.data.date, name: created.body.data.name, remark: 'Updated by automation' });
    expectOk(updated, { status: 200 });
  });

  // Test ID: T0044
  // Test Title: Verify that creating an inquiry without a name is rejected with HTTP 422
  test('T0044 | Negative | Verify that creating an inquiry without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build payload without name.
    const payload = buildInquiry();
    delete payload.name;
    // Step 2: Create and verify 422.
    const res = await new InquiryService(api).create(payload);
    expectError(res, 422);
  });

  // Test ID: T0045
  // Test Title: Verify that creating an inquiry without a date is rejected with HTTP 422
  test('T0045 | Negative | Verify that creating an inquiry without a date is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build payload without date.
    const payload = buildInquiry();
    delete payload.date;
    // Step 2: Create and verify 422.
    const res = await new InquiryService(api).create(payload);
    expectError(res, 422);
  });

  // Test ID: T0046
  // Test Title: Verify that creating an inquiry with an invalid email is rejected with HTTP 422
  test('T0046 | Negative | Verify that creating an inquiry with an invalid email is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with bad email.
    const res = await new InquiryService(api).create(buildInquiry({ email: 'not-an-email' }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0047
  // Test Title: Verify that creating an inquiry without a token is rejected with HTTP 401
  test('T0047 | Negative | Verify that creating an inquiry without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    const res = await new InquiryService(unauthApi).create(buildInquiry());
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0048
  // Test Title: Verify that a 60-character inquiry name is accepted while a 300-character name is rejected
  test('T0048 | Boundary | Verify that a 60-character inquiry name is accepted while a 300-character name is rejected', async ({ api }) => {
    // Step 1: Create with 60-char name.
    const okRes = await new InquiryService(api).create(buildInquiry({ name: 'A'.repeat(60) }));
    expectOk(okRes, { status: 200 });
    // Step 2: Create with 300-char name, verify never 200.
    const overRes = await new InquiryService(api).create(buildInquiry({ name: 'B'.repeat(300) }));
    if (overRes.status === 200) throw new Error('Oversized name (300) was accepted — expected rejection');
  });

  // Test ID: T0107
  // Test Title: Verify that adding a follow-up with a date succeeds and the follow-up list returns HTTP 200
  test('T0107 | Positive | Verify that adding a follow-up with a date succeeds and the follow-up list returns HTTP 200', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    // Step 2: Add followup with date.
    expectOk(await svc.addFollowup(id, { followup_date: '2026-10-20', remarks: 'Call back' }), { status: 200 });
    // Step 3: List followups returns 200.
    expectOk(await svc.followups(id), { status: 200 });
  });

  // Test ID: T0108
  // Test Title: Verify that adding a follow-up without a date is rejected with HTTP 422
  test('T0108 | Negative | Verify that adding a follow-up without a date is rejected with HTTP 422', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    // Step 2: Followup without date.
    expectError(await svc.addFollowup(created.body.data.id, { remarks: 'no date' }), 422);
  });

  // Test ID: T0109
  // Test Title: Verify that listing follow-ups for a non-existent inquiry returns HTTP 404
  test('T0109 | Edge | Verify that listing follow-ups for a non-existent inquiry returns HTTP 404', async ({ api }) => {
    // Step 1: List followups for non-existent id.
    expectError(await new InquiryService(api).followups(999999999), 404);
  });

  // Test ID: T0110
  // Test Title: Verify that moving an inquiry to a valid pipeline stage returns HTTP 200
  test('T0110 | Positive | Verify that moving an inquiry to a valid pipeline stage returns HTTP 200', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    // Step 2: Move to stage 2.
    expectOk(await svc.updateStage(created.body.data.id, 2), { status: 200 });
  });

  // Test ID: T0111
  // Test Title: Verify that moving an inquiry to an out-of-range stage is rejected with HTTP 422
  test('T0111 | Boundary | Verify that moving an inquiry to an out-of-range stage is rejected with HTTP 422', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    // Step 2: Invalid stage rejected.
    expectError(await svc.updateStage(created.body.data.id, 99), 422);
  });

  // Test ID: T0112
  // Test Title: Verify that setting a valid inquiry priority returns HTTP 200
  test('T0112 | Positive | Verify that setting a valid inquiry priority returns HTTP 200', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    // Step 2: Set priority 1.
    expectOk(await svc.updatePriority(created.body.data.id, 1), { status: 200 });
  });

  // Test ID: T0113
  // Test Title: Verify that setting an out-of-range inquiry priority is rejected with HTTP 422
  test('T0113 | Boundary | Verify that setting an out-of-range inquiry priority is rejected with HTTP 422', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const created = await svc.create(buildInquiry());
    expectOk(created, { status: 200 });
    // Step 2: Invalid priority rejected.
    expectError(await svc.updatePriority(created.body.data.id, 99), 422);
  });

  // Test ID: T0114
  // Test Title: Verify that fetching the inquiry pipeline summary returns HTTP 200
  test('T0114 | Positive | Verify that fetching the inquiry pipeline summary returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch pipeline.
    expectOk(await new InquiryService(api).pipeline(), { status: 200 });
  });

  // Test ID: T0115
  // Test Title: Verify that fetching the inquiry report returns HTTP 200
  test('T0115 | Positive | Verify that fetching the inquiry report returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch report.
    expectOk(await new InquiryService(api).report({ per_page: 2, page: 1 }), { status: 200 });
  });

  // Test ID: T0116
  // Test Title: Verify that searching inquiries by text returns HTTP 200
  test('T0116 | Positive | Verify that searching inquiries by text returns HTTP 200', async ({ api }) => {
    // Step 1: Search inquiries.
    expectOk(await new InquiryService(api).search('Test'), { status: 200 });
  });

  // Test ID: T0117
  // Test Title: Verify that converting an inquiry to an existing patient returns HTTP 200
  test('T0117 | Positive | Verify that converting an inquiry to an existing patient returns HTTP 200', async ({ api, cleanup }) => {
    const { PatientService } = require('../../src/services/patient.service');
    const { buildPatient } = require('../../src/data/factories/patient.factory');
    const inqSvc = new InquiryService(api);
    const patSvc = new PatientService(api);
    // Step 1: Create inquiry + patient.
    const inq = await inqSvc.create(buildInquiry());
    expectOk(inq, { status: 200 });
    const pat = await patSvc.create(buildPatient());
    expectOk(pat, { status: 200 });
    const pid = pat.body.data.data.id;
    cleanup.add(`delete patient ${pid}`, async () => patSvc.remove(pid));
    // Step 2: Convert inquiry to patient.
    expectOk(await inqSvc.convertToPatient(inq.body.data.id, pid), { status: 200 });
  });

  // Test ID: T0118
  // Test Title: Verify that converting an inquiry to a non-existent patient is rejected with HTTP 422
  test('T0118 | Negative | Verify that converting an inquiry to a non-existent patient is rejected with HTTP 422', async ({ api }) => {
    const svc = new InquiryService(api);
    // Step 1: Create inquiry.
    const inq = await svc.create(buildInquiry());
    expectOk(inq, { status: 200 });
    // Step 2: Convert with bad patient id.
    expectError(await svc.convertToPatient(inq.body.data.id, 999999999), 422);
  });

  // Test ID: T0119
  // Test Title: Verify that converting a non-existent inquiry returns HTTP 404
  test('T0119 | Edge | Verify that converting a non-existent inquiry returns HTTP 404', async ({ api }) => {
    // Step 1: Convert non-existent inquiry.
    expectError(await new InquiryService(api).convertToPatient(999999999, 1), 404);
  });

  // Test ID: T0120
  // Test Title: Verify that converting an inquiry to an appointment returns HTTP 200
  test('T0120 | Positive | Verify that converting an inquiry to an appointment returns HTTP 200', async ({ api }) => {
    const { AppointmentService } = require('../../src/services/appointment.service');
    const { buildAppointment } = require('../../src/data/factories/appointment.factory');
    const inqSvc = new InquiryService(api);
    const apptSvc = new AppointmentService(api);
    // Step 1: Create inquiry + appointment.
    const inq = await inqSvc.create(buildInquiry());
    expectOk(inq, { status: 200 });
    const payload = buildAppointment({ type: 0 });
    expectOk(await apptSvc.create(payload), { status: 200 });
    // Step 2: Locate appointment id via report search.
    const rep = await apptSvc.report({ search: payload.patient_name, per_page: 10, page: 1 });
    const aid = rep.body.data.find((r) => r.name === payload.patient_name)?.id || rep.body.data[0]?.id;
    // Step 3: Convert.
    expectOk(await inqSvc.convertToAppointment(inq.body.data.id, aid), { status: 200 });
    // Step 4: Cleanup appointment.
    await apptSvc.remove(aid);
  });

  // Test ID: T0121
  // Test Title: Verify that creating an inquiry with age 200 is rejected with HTTP 422
  test('T0121 | Boundary | Verify that creating an inquiry with age 200 is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with age over max 150.
    expectError(await new InquiryService(api).create(buildInquiry({ age: 200 })), 422);
  });
});
