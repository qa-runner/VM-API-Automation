/**
 * AbdmService — READ-ONLY wraps for the ABDM (Argus) integration tag.
 * No write tests: ABDM touches the external health-ID ecosystem.
 */
const { BaseService } = require('./base.service');

class AbdmService extends BaseService {
  /** GET /abdm/status */
  status() {
    return this.get('/abdm/status');
  }

  /** GET /abdm/patients */
  patients(query = {}) {
    return this.get('/abdm/patients', { query });
  }

  /** GET /abdm/settings (password never returned). */
  settings() {
    return this.get('/abdm/settings');
  }
}

module.exports = { AbdmService };
