# VM API Automation

A Playwright-based API test automation suite for the AyushManager VM platform. The project validates backend behavior through real HTTP requests without launching a browser, with a strong focus on smoke coverage, regression testing, and schema validation.

## 1. Overview

This suite is designed to:

- validate critical API workflows across the platform
- catch regressions early in the development cycle
- verify response contracts using schema checks
- keep test data isolated and easy to clean up
- generate useful execution reports for debugging and release decisions

The suite targets the base API at `https://apidev.ayushmanager.com/api` and is organized into three execution layers:

- Smoke: fast validation of critical health and auth flows
- Regression: broader functional coverage
- Contract: schema and response-shape validation

---

## 2. Why this project exists

A reliable API suite should answer three questions quickly:

1. Is the system healthy?
2. Did a recent change break expected behavior?
3. Are the API contracts still valid?

This project is built for those checks. It combines Playwright's test runner, environment validation, common API abstractions, and structured reporting so that contributors can add or run tests without reinventing the setup each time.

---

## 3. Key capabilities

- centralized environment configuration with fail-fast validation
- shared API client with auth handling and request logging
- automatic token reuse and refresh logic for login-based flows
- transient retry handling for 429, 5xx, and network errors
- standard test naming and structure across modules
- request/response capture for debugging and reporting
- built-in support for Playwright HTML and Allure reporting

---

## 4. Technology stack

| Layer | Tool / Library | Purpose |
|---|---|---|
| Test runner | Playwright Test | API automation execution |
| Runtime | Node.js | JavaScript execution |
| Validation | Zod | Response schema validation |
| Data generation | Faker.js | Unique test payload generation |
| Reporting | Playwright HTML + Allure | Test reporting and debugging |
| Config | dotenv | Environment management |

---

## 5. Prerequisites

Before running the suite, make sure the following are available:

- Node.js 18+ or a compatible LTS version
- npm
- valid credentials for the target environment
- Java installed if you want to use the Allure command-line report generator

> The suite is API-first and does not require a browser to run.

---

## 6. Quick start

```bash
cp .env.example .env
# update BASE_URL, AUTH_IDENTIFIER, and AUTH_PASSWORD as needed

npm install
npm run smoke
npm run full
npm run contract
```

### Recommended local flow

```bash
npm run smoke     # run first; verifies health + auth
npm run full      # run the broader regression suite
npm run report    # open Playwright HTML report
```

---

## 7. Environment configuration

Create a `.env` file based on `.env.example` and set the required values.

```env
BASE_URL=https://apidev.ayushmanager.com/api
AUTH_IDENTIFIER=your_login_identifier
AUTH_PASSWORD=your_password
WORKERS=4
SLA_MS=5000
LOG_LEVEL=1
RETRY_COUNT=2
RETRY_BASE_DELAY_MS=500
```

### Variables explained

| Variable | Required | Description |
|---|---|---|
| `BASE_URL` | Yes | Base URL for the API under test |
| `AUTH_IDENTIFIER` | Yes | Login identifier such as mobile number or email |
| `AUTH_PASSWORD` | Yes | Password used to authenticate |
| `WORKERS` | No | Local worker count for parallel execution |
| `SLA_MS` | No | Maximum allowed API response time in milliseconds |
| `LOG_LEVEL` | No | `0` silent, `1` info, `2` debug request/response details |
| `RETRY_COUNT` | No | Retry count for transient failures |
| `RETRY_BASE_DELAY_MS` | No | Delay before retrying transient failures |

If required values are missing, the project fails early with a clear error message instead of failing later with a confusing 401 or null response.

---

## 8. Execution commands

| Command | Purpose | Typical use |
|---|---|---|
| `npm test` | Runs the default Playwright suite | general local validation |
| `npm run smoke` | Runs only smoke tests | first check after change or before push |
| `npm run full` | Runs the regression suite | broader validation before merge |
| `npm run contract` | Runs contract/schema tests only | validating API contract changes |
| `npm run one "PAT-001"` | Runs tests matching a keyword or ID | targeted debugging |
| `npm run report` | Opens the HTML report | review the latest run |
| `npm run allure` | Builds and opens Allure report | detailed investigation with rich attachments |
| `npm run clean` | Removes old result folders | start fresh before a run |
| `npm run lint` | Runs ESLint | style and quality checks |
| `npm run format` | Formats JS files with Prettier | auto-fix formatting issues |

### Example single-test runs

```bash
npm run one "T0027"
npm run one "patient"
npm run one "auth"
```

---

## 9. Project structure

```text
.
├── .env.example
├── azure-pipelines.yml
├── global-setup.js
├── playwright.config.js
├── package.json
├── README.md
├── src/
│   ├── auth/
│   ├── client/
│   ├── config/
│   ├── data/
│   ├── fixtures/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── tests/
│   ├── auth/
│   ├── health/
│   ├── patient/
│   ├── appointments/
│   ├── billing/
│   ├── contract/
│   └── ... domain-based test folders
├── test-results/
├── playwright-report/
├── allure-results/
├── allure-report/
└── ...
```

### Main folders

- `src/config/` - environment variables and config validation
- `src/client/` - shared HTTP client logic
- `src/auth/` - login/token management
- `src/fixtures/` - reusable fixtures such as `api`, `unauthApi`, and `cleanup`
- `src/services/` - domain-specific API service classes
- `src/data/` - data factories and payload builders
- `src/schemas/` - Zod contract definitions
- `src/utils/` - assertions, retries, logging, cleanup helpers
- `tests/` - actual test suite organized by module

---

## 10. Test standards and conventions

Every test follows a consistent pattern for clarity and maintainability.

### Standard naming pattern

```js
/**
 * Test ID: PAT-001
 * Title: Create patient with valid data succeeds
 * Type: Positive
 */
test('PAT-001 | Positive | create patient with valid data succeeds', async ({ api, cleanup }) => {
  // Step 1: Build a unique valid payload.
  const payload = buildPatient();

  // Step 2: Send the API request.
  const res = await new PatientService(api).create(payload);

  // Step 3: Validate status and schema.
  expectOk(res, { status: 200 });
});
```

### Supported test types

- `Positive` - expected success scenarios
- `Negative` - invalid data or expected failure handling
- `Edge` - unusual or boundary-adjacent inputs
- `Boundary` - min/max, length limits, enum constraints, and similar limits

### Good test practices

- keep tests short and scenario-focused
- use unique data per run to avoid collisions
- validate both status code and response schema when relevant
- attach cleanup registration for anything created during the test
- name tests clearly with `ID | Type | title`

---

## 11. Test data management and cleanup

The suite is designed to minimize residual test data in shared developer environments.

### Cleanup behavior

Each test can register created records in the `cleanup` fixture. When the test finishes, the system attempts to remove those created records regardless of pass or fail status.

This means data created through API operations such as patients, appointments, invoices, bills, users, roles, branches, and related domain records should normally be cleaned up automatically when the test has a proper delete API.

### Expected leftover data

Some data cannot be deleted through the current API. This is expected in the shared `apidev` environment and should not be treated as a test failure.

| Data type | Approx. per run | Why it remains |
|---|---:|---|
| Inquiries | ~12 | no delete endpoint for these rows |
| Medicine bills | ~5 | linked auto-generated records |
| Therapy packages | ~4 | created as part of data flow |
| Suppliers | ~2 | generated test supplier records |
| Purchase returns | ~1 | expected non-removable test artifact |

The project intentionally avoids a blanket `clean:data` script because unsafe mass deletion against shared dev data would be risky. Cleanup is targeted and controlled.

---

## 12. Adding a new API domain

Use the same structure for each domain module to keep the project consistent.

### Typical pattern

1. create a service class in `src/services/`
2. add a schema in `src/schemas/`
3. add a factory in `src/data/factories/`
4. create a domain test file under `tests/`
5. register cleanup for any created entities

Example:

```text
src/services/invoice.service.js
src/schemas/invoice.schema.js
src/data/factories/invoice.factory.js
tests/invoices/invoices.spec.js
```

This keeps the suite modular and makes domain growth manageable without changing the base test framework.

---

## 13. Retries and failure handling

The suite is intentionally conservative with retries:

- transient failures are retried
- `429`, `5xx`, and network errors are considered retryable
- `4xx` validation errors are not blindly retried
- retry logic is configured centrally and should be treated as infrastructure protection, not as a substitute for fixing broken API behavior

This helps avoid flaky results from temporary backend issues while still keeping genuine contract or validation issues visible.

---

## 14. Reporting

The project supports multiple reporting styles.

### Playwright HTML report

```bash
npm run report
```

Useful for quick review of passed/failed tests, traces, and summary metrics.

### Allure report

```bash
npm run allure
```

Useful for detailed investigation of test history, attachments, request/response payloads, and grouped behaviors.

### JUnit output

The suite writes JUnit XML to `test-results/junit.xml`, which integrates well with Azure DevOps and CI pipelines.

---

## 15. CI and Azure pipeline notes

The repository includes `azure-pipelines.yml` for pipeline-oriented execution.

Typical CI flow:

1. install dependencies
2. run smoke tests
3. run regression suite
4. publish JUnit results
5. publish HTML and Allure artifacts for debugging

This gives the team both fast validation and a detailed artifact trail for release quality decisions.

---

## 16. Troubleshooting

### Auth fails or login is rejected

Check:

- `.env` file exists and is correctly populated
- `AUTH_IDENTIFIER` and `AUTH_PASSWORD` are valid
- `BASE_URL` is correct for the environment

### Tests are flaky or fail intermittently

Check:

- transient retry settings in `.env`
- shared backend state or test data collisions
- recent API changes impacting schema or payload structure

### Report output is stale or confusing

```bash
npm run clean
```

Then rerun the relevant suite.

### Debug one failing scenario

```bash
npm run one "PAT-001"
```

or search by a unique test keyword, folder name, or part of the title.

---

## 17. Summary

This project is a scalable, professional API automation framework built to support reliable regression testing for the VM platform. It emphasizes:

- clear organization
- strong conventions
- reusable API abstractions
- data hygiene
- actionable reports
- fast validation with targeted execution

If you are contributing to the suite, follow the existing structure, use the shared utilities, and keep tests simple, explicit, and uniquely identifiable.
