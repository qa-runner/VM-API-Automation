/**
 * WaitingService — wraps Patient Waiting tag.
 * Save/list are POST JSON (case_id required). Delete is
 * DELETE /patient/waiting/delete/{id}; missing id 500s (should be 404).
 */
const { BaseService } = require('./base.service');

class WaitingService extends BaseService {
  /** POST /patient/waiting/save — JSON {case_id, patient_id, date}. */
  save(payload) {
    return this.post('/patient/waiting/save', { body: payload });
  }

  /** POST /patient/waiting/list — JSON {date}. */
  list(payload = {}) {
    return this.post('/patient/waiting/list', { body: payload });
  }

  /** DELETE /patient/waiting/delete/{id} */
  remove(id) {
    return this.delete(`/patient/waiting/delete/${id}`);
  }
}

module.exports = { WaitingService };
