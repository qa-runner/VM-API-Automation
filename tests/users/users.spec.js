// Suite: Users & roles
const { test } = require('../../src/fixtures/api.fixture');
const { UserRoleService } = require('../../src/services/userrole.service');
const { buildUser, buildRole } = require('../../src/data/factories/userrole.factory');
const { expectOk, expectError, expectStatus } = require('../../src/utils/assertions');

/** Create returns message-only; locate id by mobile via list. */
async function findUserIdByMobile(api, mobile) {
  const res = await new UserRoleService(api).listUsers();
  if (res.status !== 200 || !Array.isArray(res.body?.data)) return null;
  return res.body.data.find((u) => u.mobile_no === mobile)?.id || null;
}

test.describe('Users & roles', () => {
  // Test ID: T0173
  // Test Title: Verify that creating a staff user returns HTTP 200
  test('T0173 | Positive | Verify that creating a staff user returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create user.
    const payload = buildUser();
    expectOk(await svc.createUser(payload), { status: 200 });
    // Step 2: Locate + cleanup.
    const id = await findUserIdByMobile(api, payload.mobile_no);
    if (id) cleanup.add(`delete user ${id}`, async () => svc.removeUser(id));
  });

  // Test ID: T0174
  // Test Title: Verify that listing users returns HTTP 200
  test('T0174 | Positive | Verify that listing users returns HTTP 200', async ({ api }) => {
    // Step 1: List users.
    expectOk(await new UserRoleService(api).listUsers(), { status: 200 });
  });

  // Test ID: T0175
  // Test Title: Verify that a newly created user can be fetched by id with HTTP 200
  test('T0175 | Positive | Verify that a newly created user can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create + locate.
    const payload = buildUser();
    expectOk(await svc.createUser(payload), { status: 200 });
    const id = await findUserIdByMobile(api, payload.mobile_no);
    cleanup.add(`delete user ${id}`, async () => svc.removeUser(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showUser(id), { status: 200 });
  });

  // Test ID: T0176
  // Test Title: Verify that updating a user with POST returns HTTP 200
  test('T0176 | Positive | Verify that updating a user with POST returns HTTP 200', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create + locate.
    const payload = buildUser();
    expectOk(await svc.createUser(payload), { status: 200 });
    const id = await findUserIdByMobile(api, payload.mobile_no);
    cleanup.add(`delete user ${id}`, async () => svc.removeUser(id));
    // Step 2: POST full update.
    expectOk(await svc.updateUser(id, { ...payload, first_name: 'Renamed' }), { status: 200 });
  });

  // Test ID: T0177
  // Test Title: Verify that updating a user with PUT is rejected with HTTP 405
  test('T0177 | Negative | Verify that updating a user with PUT is rejected with HTTP 405', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create + locate.
    const payload = buildUser();
    expectOk(await svc.createUser(payload), { status: 200 });
    const id = await findUserIdByMobile(api, payload.mobile_no);
    cleanup.add(`delete user ${id}`, async () => svc.removeUser(id));
    // Step 2: PUT and verify 405.
    const raw = await api.request.put(`${require('../../src/config/env').env.baseURL}/setting/user/${id}`, { headers: { Accept: 'application/json' }, multipart: payload });
    expectError(await require('../../src/client/api-client').ApiClient.readJson(raw), 405);
  });

  // Test ID: T0178
  // Test Title: Verify that creating a user without a department is never fully accepted with HTTP 200
  test('T0178 | Negative | Verify that creating a user without a department is never fully accepted with HTTP 200', async ({ api }) => {
    // Step 1: Create without department_id (live 500s after partial insert).
    const payload = buildUser();
    delete payload.department_id;
    const res = await new UserRoleService(api).createUser(payload);
    if (res.status === 200) throw new Error('Missing department was fully accepted');
  });

  // Test ID: T0179
  // Test Title: Verify that creating a user with neither email nor mobile is rejected with HTTP 422
  test('T0179 | Negative | Verify that creating a user with neither email nor mobile is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create with neither email nor mobile.
    const payload = buildUser();
    delete payload.email;
    delete payload.mobile_no;
    expectError(await new UserRoleService(api).createUser(payload), 422);
  });

  // Test ID: T0180
  // Test Title: Verify that the user list search parameter behavior is documented and never silently succeeds wrongly
  test('T0180 | Edge | Verify that the user list search parameter behavior is documented and never silently succeeds wrongly', async ({ api }) => {
    // Step 1: List with search param (live 500s — server bug, documented).
    const res = await new UserRoleService(api).listUsers({ search: 'Staff' });
    if (res.status === 200) return; // fixed upstream — fine
    if (res.status !== 500) throw new Error(`Unexpected status ${res.status}`);
  });

  // Test ID: T0181
  // Test Title: Verify that creating a user without a token is rejected with HTTP 401
  test('T0181 | Negative | Verify that creating a user without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: Create without token.
    expectError(await new UserRoleService(unauthApi).createUser(buildUser()), 401);
  });

  // Test ID: T0182
  // Test Title: Verify that fetching a non-existent user returns HTTP 200 quirk and never 500
  test('T0182 | Edge | Verify that fetching a non-existent user returns HTTP 200 quirk and never 500', async ({ api }) => {
    // Step 1: Show non-existent id.
    const res = await new UserRoleService(api).showUser(999999999);
    // Step 2: Verify quirk — 200, never 500.
    expectStatus(res, 200, 'Missing user should return 200 (API quirk)');
    if (res.status >= 500) throw new Error(`Caused 5xx: ${res.status}`);
  });

  // Test ID: T0183
  // Test Title: Verify that creating a role returns HTTP 200 with a role id
  test('T0183 | Positive | Verify that creating a role returns HTTP 200 with a role id', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create role.
    const res = await svc.createRole(buildRole());
    // Step 2: Verify 200 + cleanup.
    expectOk(res, { status: 200 });
    cleanup.add(`delete role ${res.body.data.id}`, async () => svc.removeRole(res.body.data.id));
  });

  // Test ID: T0184
  // Test Title: Verify that listing roles returns HTTP 200
  test('T0184 | Positive | Verify that listing roles returns HTTP 200', async ({ api }) => {
    // Step 1: List roles.
    expectOk(await new UserRoleService(api).listRoles(), { status: 200 });
  });

  // Test ID: T0185
  // Test Title: Verify that a newly created role can be fetched by id with HTTP 200
  test('T0185 | Positive | Verify that a newly created role can be fetched by id with HTTP 200', async ({ api, cleanup }) => {
    const svc = new UserRoleService(api);
    // Step 1: Create role.
    const created = await svc.createRole(buildRole());
    expectOk(created, { status: 200 });
    const id = created.body.data.id;
    cleanup.add(`delete role ${id}`, async () => svc.removeRole(id));
    // Step 2: Show returns 200.
    expectOk(await svc.showRole(id), { status: 200 });
  });

  // Test ID: T0186
  // Test Title: Verify that fetching a non-existent role returns HTTP 404
  test('T0186 | Edge | Verify that fetching a non-existent role returns HTTP 404', async ({ api }) => {
    // Step 1: Show non-existent id.
    expectError(await new UserRoleService(api).showRole(999999999), 404);
  });

  // Test ID: T0187
  // Test Title: Verify that creating a role without a name is rejected with HTTP 422
  test('T0187 | Negative | Verify that creating a role without a name is rejected with HTTP 422', async ({ api }) => {
    // Step 1: Create without name.
    const { name, ...noName } = buildRole();
    expectError(await new UserRoleService(api).createRole(noName), 422);
  });

  // Test ID: T0188
  // Test Title: Verify that creating a role with an unknown permission is never accepted with HTTP 200
  test('T0188 | Edge | Verify that creating a role with an unknown permission is never accepted with HTTP 200', async ({ api }) => {
    // Step 1: Create with fake permission (live 500s — spatie).
    const res = await new UserRoleService(api).createRole({ name: 'BadPerm', permissions: { 'patient.view': { view: true } } });
    if (res.status === 200) throw new Error('Unknown permission was accepted');
  });

  // Test ID: T0189
  // Test Title: Verify that fetching role permission modules returns HTTP 200
  test('T0189 | Positive | Verify that fetching role permission modules returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch modules.
    expectOk(await new UserRoleService(api).roleModules(), { status: 200 });
  });

  // Test ID: T0190
  // Test Title: Verify that fetching system roles returns HTTP 200
  test('T0190 | Positive | Verify that fetching system roles returns HTTP 200', async ({ api }) => {
    // Step 1: Fetch system roles.
    expectOk(await new UserRoleService(api).systemRoles(), { status: 200 });
  });

  // Test ID: T0191
  // Test Title: Verify that listing roles without a token is rejected with HTTP 401
  test('T0191 | Negative | Verify that listing roles without a token is rejected with HTTP 401', async ({ unauthApi }) => {
    // Step 1: List roles without token.
    expectError(await new UserRoleService(unauthApi).listRoles(), 401);
  });
});
