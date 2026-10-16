// Suite: Contract | critical response schemas
const { test } = require('../../src/fixtures/api.fixture');
const { AuthService } = require('../../src/services/auth.service');
const { PatientService } = require('../../src/services/patient.service');
const { env } = require('../../src/config/env');
const { expectOk, expectSchema } = require('../../src/utils/assertions');
const { loginSuccessSchema } = require('../../src/schemas/auth.schema');
const { patientListSuccessSchema } = require('../../src/schemas/patient.schema');

test.describe('Contract | critical response schemas', () => {
  // Test ID: T0049
  // Test Title: Verify that the login response contract matches the stored schema snapshot
  test('T0049 | Contract | Verify that the login response contract matches the stored schema snapshot', async ({ unauthApi }) => {
    // Step 1: Login with valid credentials.
    const res = await new AuthService(unauthApi).login({ identifier: env.authIdentifier, password: env.authPassword });
    // Step 2: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(loginSuccessSchema, res.body, 'Login contract');
  });

  // Test ID: T0050
  // Test Title: Verify that the patient list response contract matches the stored schema snapshot
  test('T0050 | Contract | Verify that the patient list response contract matches the stored schema snapshot', async ({ api }) => {
    // Step 1: List patients.
    const res = await new PatientService(api).list({ per_page: 5, page: 1 });
    // Step 2: Verify 200 + schema.
    expectOk(res, { status: 200 });
    expectSchema(patientListSuccessSchema, res.body, 'Patient list contract');
  });
});
