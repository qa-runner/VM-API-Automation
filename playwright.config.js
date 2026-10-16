/**
 * Playwright configuration for VM API Automation.
 * Three projects: smoke (fast critical path), regression (full), contract (schema).
 * Reporters: list + html + junit (Azure DevOps) + allure.
 * @see https://playwright.dev/docs/test-configuration
 */
require('dotenv').config();

const { defineConfig } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://apidev.ayushmanager.com/api';
const WORKERS = parseInt(process.env.WORKERS || '4', 10);

module.exports = defineConfig({
  testDir: './tests',
  timeout: 45 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retry: 2 on CI (handles flaky 5xx/429/cold-start), 1 locally.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : WORKERS,
  globalSetup: require.resolve('./global-setup.js'),
  use: {
    baseURL: BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
    // Trace + screenshot only matter for UI; for API we capture traces on failure.
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      testMatch: ['**/health/*.spec.js', '**/auth/*.spec.js'],
      retries: 2,
    },
    {
      name: 'regression',
      testIgnore: ['**/contract/*.spec.js'],
    },
    {
      name: 'contract',
      testMatch: ['**/contract/*.spec.js'],
    },
  ],
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    // JUnit is natively consumed by Azure DevOps Pipelines (PublishTestResults).
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['./src/utils/allure-logger.js'],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  ],
});
