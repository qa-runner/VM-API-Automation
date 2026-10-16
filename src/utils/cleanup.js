/**
 * Best-effort cleanup registry.
 * Specs register async delete callbacks; registry runs them in reverse order.
 * Failures are logged, never thrown (cleanup must not fail the test).
 */
const logger = require('./logger');

class TestDataRegistry {
  constructor() {
    this._tasks = [];
  }

  /** @param {string} label @param {() => Promise<void>} fn */
  add(label, fn) {
    this._tasks.push({ label, fn });
  }

  async clear() {
    for (let i = this._tasks.length - 1; i >= 0; i--) {
      const { label, fn } = this._tasks[i];
      try {
        await fn();
        logger.info(`[cleanup] OK: ${label}`);
      } catch (err) {
        logger.warn(`[cleanup] FAILED: ${label}: ${err.message}`);
      }
    }
    this._tasks = [];
  }
}

module.exports = { TestDataRegistry };
