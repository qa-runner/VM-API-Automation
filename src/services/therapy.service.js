/**
 * TherapyService — wraps Patient Therapy Packages + Schedule Therapy tags.
 * Package create is JSON (patient_name + date required; missing date 500s).
 * Update is POST JSON incl. mobile_no (PUT → 405). No package delete endpoint.
 */
const { BaseService } = require('./base.service');

class TherapyService extends BaseService {
  /** POST /patient/therapy (JSON). */
  createPackage(payload) {
    return this.post('/patient/therapy', { body: payload });
  }

  /** GET /patient/therapy/list */
  listPackages(query = { per_page: 5, page: 1 }) {
    return this.get('/patient/therapy/list', { query });
  }

  /** GET /patient/therapy/{id} — missing id returns 200 empty (quirk). */
  showPackage(id) {
    return this.get(`/patient/therapy/${id}`);
  }

  /** POST /patient/therapy/{id} — update uses POST, not PUT. */
  updatePackage(id, payload) {
    return this.post(`/patient/therapy/${id}`, { body: payload });
  }

  /** POST /patient/therapy/advice — JSON {patient_id, case_id, date, slots}. */
  createAdvice(payload) {
    return this.post('/patient/therapy/advice', { body: payload });
  }

  /** GET /patient/therapy/adviced */
  listAdviced(query = { per_page: 5, page: 1 }) {
    return this.get('/patient/therapy/adviced', { query });
  }

  /** GET /patient/therapy/{id}/pdf — returns 200 (public URL); missing 500s. */
  pdf(id) {
    return this.get(`/patient/therapy/${id}/pdf`);
  }

  /** GET /patient/schedule-therapies */
  listScheduled() {
    return this.get('/patient/schedule-therapies');
  }
}

module.exports = { TherapyService };
