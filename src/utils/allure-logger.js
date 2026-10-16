/**
 * Custom Playwright reporter that appends request/response lines to Allure steps.
 * Lightweight: no dependency on allure internals; the real Allure report is
 * produced by `allure-playwright` (see playwright.config.js).
 * This reporter only enriches console output for Azure DevOps logs.
 */
class AllureLogger {
  onTestEnd(test, result) {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;
    const url = test.location ? `${test.location.file}:${test.location.line}` : '';
    console.log(`[report] FAILED: ${test.title} ${url}`);
    if (result.error) console.log(`[report] ${result.error.message?.slice(0, 2000)}`);
  }
}

module.exports = AllureLogger;
