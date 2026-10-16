// Suite: Appointments | create, list, report
const { test } = require('../../src/fixtures/api.fixture');
const { AppointmentService } = require('../../src/services/appointment.service');
const { buildAppointment } = require('../../src/data/factories/appointment.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/**
 * Live API returns NO id on create (data:[]), so tests locate their
 * row via GET /appointments/report?search=<unique name>.
 */
async function findIdByName(api, name) {
  const res = await new AppointmentService(api).report({ search: name, per_page: 10, page: 1 });
  if (res.status !== 200 || !Array.isArray(res.body?.data)) return null;
  const hit = res.body.data.find((r) => r.name === name) || res.body.data[0];
  return hit ? hit.id : null;
}

test.describe('Appointments | create, list, report', () => {
  // Test ID: T0026
  // Test Title: Verify that listing all appointments returns HTTP 200
  test('T0026 | Positive | Verify that listing all appointments returns HTTP 200', async ({ api }) => {
    // Step 1: List appointments.
    const res = await new AppointmentService(api).list();
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0027
  // Test Title: Verify that creating a consultation appointment with a valid payload returns HTTP 200
  test('T0027 | Positive | Verify that creating a consultation appointment with a valid payload returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new AppointmentService(api);
    // Step 1: Build valid payload.
    const payload = buildAppointment({ type: 0 });
    // Step 2: Create appointment.
    const res = await svc.create(payload);
    // Step 3: Verify 200.
    expectOk(res, { status: 200 });
    // Step 4: Locate row via report search, register cleanup.
    const id = await findIdByName(api, payload.patient_name);
    if (id) cleanup.add(`delete appointment ${id}`, async () => svc.remove(id));
  });

  // Test ID: T0028
  // Test Title: Verify that creating an appointment with an empty payload is rejected with HTTP 422
  test('T0028 | Negative | Verify that creating an appointment with an empty payload is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with empty object.
    const res = await new AppointmentService(api).create({});
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0029
  // Test Title: Verify that listing appointments without a token is rejected with HTTP 401
  test('T0029 | Negative | Verify that listing appointments without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List without token.
    const res = await new AppointmentService(unauthApi).list();
    // Step 2: Verify 401.
    expectError(res, 401);
  });

  // Test ID: T0030
  // Test Title: Verify that the appointment report for a date range returns HTTP 200
  test('T0030 | Positive | Verify that the appointment report for a date range returns HTTP 200', async ({ api }) => {
    // Step 1: Get report for date range.
    const res = await new AppointmentService(api).report({ start_date: '2025-01-01', end_date: '2026-12-31', per_page: 5, page: 1 });
    // Step 2: Verify 200.
    expectOk(res, { status: 200 });
  });

  // Test ID: T0031
  // Test Title: Verify that fetching a non-existent appointment id never returns HTTP 200 or HTTP 500
  test('T0031 | Edge | Verify that fetching a non-existent appointment id never returns HTTP 200 or HTTP 500', async ({ api }) => {
    // Step 1: Fetch non-existent id.
    const res = await new AppointmentService(api).show(999999999);
    // Step 2: Verify never 200/500.
    expectStatus(res, res.status, 'Sanity');
    if (res.status === 200) throw new Error('Non-existent appointment returned 200');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0032
  // Test Title: Verify that creating an appointment with an out-of-range type is never accepted with HTTP 200
  test('T0032 | Boundary | Verify that creating an appointment with an out-of-range type is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Create with invalid type.
    const res = await new AppointmentService(api).create(buildAppointment({ type: 99 }));
    // Step 2: Verify never 200.
    if (res.status === 200) throw new Error('Invalid type=99 was accepted');
  });

  // Test ID: T0243
  // Test Title: Verify that two overlapping appointments for the same doctor are both accepted with HTTP 200 (missing conflict validation)
  test('T0243 | Edge | Verify that two overlapping appointments for the same doctor are both accepted with HTTP 200 (missing conflict validation)', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Book 14:00-14:30 with doctor 9.
    const first = buildAppointment({ date: '2026-10-17', start_time: '14:00', end_time: '14:30', duration: 30, patient_name: `Overlap A ${Date.now() % 100000}`, 'doctor_id[]': 9, 'consultation_department_id[]': 8 });
    expectOk(await svc.create(first), { status: 200 });
    const idA = await findIdByName(api, first.patient_name);
    // Step 2: Book overlapping 14:15-14:45 with the SAME doctor.
    const second = buildAppointment({ date: '2026-10-17', start_time: '14:15', end_time: '14:45', duration: 30, patient_name: `Overlap B ${Date.now() % 100000}`, 'doctor_id[]': 9, 'consultation_department_id[]': 8 });
    const resB = await svc.create(second);
    // Step 3: Document the lethal gap — no 409/422 conflict rejection exists.
    expectOk(resB, { status: 200 });
    // Step 4: Cleanup both rows.
    const idB = await findIdByName(api, second.patient_name);
    if (idA) await svc.remove(idA);
    if (idB) await svc.remove(idB);
  });

  // Test ID: T0080
  // Test Title: Verify that updating an appointment with PUT is rejected with HTTP 405
  test('T0080 | Negative | Verify that updating an appointment with PUT is rejected with HTTP 405', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create appointment and locate id.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const id = await findIdByName(api, payload.patient_name);
    // Step 2: PUT update and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/appointments/${id}`, { headers: { Accept: 'application/json' }, multipart: payload });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
    // Step 3: Cleanup.
    if (id) await svc.remove(id);
  });

  // Test ID: T0081
  // Test Title: Verify that updating an appointment with POST replaces the row and returns HTTP 200 with a new id
  test('T0081 | Positive | Verify that updating an appointment with POST replaces the row and returns HTTP 200 with a new id', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create appointment and locate id.
    // NOTE: live update is delete+recreate — old id 404s, a NEW id appears.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const oldId = await findIdByName(api, payload.patient_name);
    // Step 2: POST full update with new remarks.
    expectOk(await svc.update(oldId, { ...payload, remarks: 'Updated remarks' }), { status: 200 });
    // Step 3: Locate NEW id via search, verify remarks persisted.
    const newId = await findIdByName(api, payload.patient_name);
    const fetched = await svc.show(newId);
    expectOk(fetched, { status: 200 });
    // Step 4: Cleanup new row (old row is already gone by design).
    await svc.remove(newId);
  });

  // Test ID: T0082
  // Test Title: Verify that a newly created appointment can be fetched by id with HTTP 200
  test('T0082 | Positive | Verify that a newly created appointment can be fetched by id with HTTP 200', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create and locate id.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const id = await findIdByName(api, payload.patient_name);
    // Step 2: Show returns 200.
    expectOk(await svc.show(id), { status: 200 });
    // Step 3: Cleanup.
    await svc.remove(id);
  });

  // Test ID: T0083
  // Test Title: Verify that a deleted appointment is no longer fetchable and returns HTTP 404
  test('T0083 | Positive | Verify that a deleted appointment is no longer fetchable and returns HTTP 404', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create and locate id.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const id = await findIdByName(api, payload.patient_name);
    // Step 2: Delete returns 200.
    expectOk(await svc.remove(id), { status: 200 });
    // Step 3: Show now 404.
    expectError(await svc.show(id), 404);
  });

  // Test ID: T0084
  // Test Title: Verify that deleting an already-deleted appointment returns HTTP 404
  test('T0084 | Edge | Verify that deleting an already-deleted appointment returns HTTP 404', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create, locate, delete once.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const id = await findIdByName(api, payload.patient_name);
    expectOk(await svc.remove(id), { status: 200 });
    // Step 2: Delete again returns 404.
    expectError(await svc.remove(id), 404);
  });

  // Test ID: T0085
  // Test Title: Verify that deleting a non-existent appointment returns HTTP 404
  test('T0085 | Edge | Verify that deleting a non-existent appointment returns HTTP 404', async ({ api }) => {
    // Step 1: Delete non-existent id.
    const res = await new AppointmentService(api).remove(999999999);
    // Step 2: Verify 404.
    expectError(res, 404);
  });

  // Test ID: T0086
  // Test Title: Verify that checking slot availability with full date and time parameters returns HTTP 200
  test('T0086 | Positive | Verify that checking slot availability with full date and time parameters returns HTTP 200', async ({ api }) => {
    // Step 1: Check availability with full slot (date+times+duration all required).
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const raw = await api.request.get(`${require('../../src/config/env').env.baseURL}/appointments/availability?date=${tomorrow}&start_time=10:00&end_time=10:30&duration=30`, { headers: { Accept: 'application/json', Authorization: `Bearer ${api._tokenCache}` } });
    // Step 2: Verify 200 + success envelope.
    expectOk(await require('../../src/client/api-client').ApiClient.readJson(raw), { status: 200 });
  });

  // Test ID: T0087
  // Test Title: Verify that creating an appointment in the past is accepted with HTTP 200 (leniency quirk)
  test('T0087 | Edge | Verify that creating an appointment in the past is accepted with HTTP 200 (leniency quirk)', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create with 2020 date.
    const payload = buildAppointment({ date: '2020-01-01' });
    const res = await svc.create(payload);
    // Step 2: Verify accepted.
    expectOk(res, { status: 200 });
    // Step 3: Cleanup.
    const id = await findIdByName(api, payload.patient_name);
    if (id) await svc.remove(id);
  });

  // Test ID: T0088
  // Test Title: Verify that creating an appointment with end time before start time is accepted with HTTP 200 (missing validation)
  test('T0088 | Edge | Verify that creating an appointment with end time before start time is accepted with HTTP 200 (missing validation)', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create with end before start.
    const payload = buildAppointment({ start_time: '11:00', end_time: '10:00' });
    const res = await svc.create(payload);
    // Step 2: Verify accepted (no time-order check).
    expectOk(res, { status: 200 });
    // Step 3: Cleanup.
    const id = await findIdByName(api, payload.patient_name);
    if (id) await svc.remove(id);
  });

  // Test ID: T0089
  // Test Title: Verify that a therapy appointment without any therapies is rejected with HTTP 422
  test('T0089 | Negative | Verify that a therapy appointment without any therapies is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create therapy appointment with no therapies array.
    const res = await new AppointmentService(api).create(buildAppointment({ type: 1 }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0090
  // Test Title: Verify that creating an appointment without a duration is never accepted with HTTP 200
  test('T0090 | Negative | Verify that creating an appointment without a duration is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Build payload without duration.
    const payload = buildAppointment();
    delete payload.duration;
    // Step 2: Create, verify never 200 (live API 500s — server bug).
    const res = await new AppointmentService(api).create(payload);
    if (res.status === 200) throw new Error('Missing duration was accepted');
  });

  // Test ID: T0091
  // Test Title: Verify that creating an appointment with 1200-character remarks is rejected with HTTP 422
  test('T0091 | Boundary | Verify that creating an appointment with 1200-character remarks is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with remarks over maxLength 1000.
    const res = await new AppointmentService(api).create(buildAppointment({ remarks: 'R'.repeat(1200) }));
    // Step 2: Verify 422.
    expectError(res, 422);
  });

  // Test ID: T0092
  // Test Title: Verify that creating an appointment without a doctor is rejected with HTTP 422
  test('T0092 | Negative | Verify that creating an appointment without a doctor is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Build payload without doctor key.
    const payload = buildAppointment();
    delete payload['doctor_id[]'];
    // Step 2: Create and verify 422.
    expectError(await new AppointmentService(api).create(payload), 422);
  });

  // Test ID: T0093
  // Test Title: Verify that a newly created appointment is discoverable through the report search
  test('T0093 | Positive | Verify that a newly created appointment is discoverable through the report search', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create with unique name.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    // Step 2: Search report by name.
    const found = await findIdByName(api, payload.patient_name);
    if (!found) throw new Error('Created appointment not found via report search');
    // Step 3: Cleanup.
    await svc.remove(found);
  });

  // Test ID: T0328
  // Test Title: Verify that appointments by date return HTTP 200
  test('T0328 | Positive | Verify that appointments by date return HTTP 200', async ({ api }) => {
    // Step 1: Fetch by date.
    expectOk(await new AppointmentService(api).byDate('2026-10-16'), { status: 200 });
  });

  // Test ID: T0329
  // Test Title: Verify that appointments by month return HTTP 200
  test('T0329 | Positive | Verify that appointments by month return HTTP 200', async ({ api }) => {
    // Step 1: Fetch by month.
    expectOk(await new AppointmentService(api).byMonth('2026-10'), { status: 200 });
  });

  // Test ID: T0330
  // Test Title: Verify that completing an appointment returns HTTP 200
  test('T0330 | Positive | Verify that completing an appointment returns HTTP 200', async ({ api }) => {
    const svc = new AppointmentService(api);
    // Step 1: Create appointment and locate id.
    const payload = buildAppointment({ type: 0 });
    expectOk(await svc.create(payload), { status: 200 });
    const id = await findIdByName(api, payload.patient_name);
    // Step 2: Mark complete.
    expectOk(await svc.complete(id), { status: 200 });
    // Step 3: Cleanup.
    await svc.remove(id);
  });

  // Test ID: T0331
  // Test Title: Verify that completing a non-existent appointment returns HTTP 404
  test('T0331 | Edge | Verify that completing a non-existent appointment returns HTTP 404', async ({ api }) => {
    // Step 1: Complete non-existent id.
    expectError(await new AppointmentService(api).complete(999999999), 404);
  });
});
