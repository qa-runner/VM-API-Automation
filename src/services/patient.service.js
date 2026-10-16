/**
 * PatientService — wraps Patient tag endpoints.
 * POST /patient is multipart/form-data (first_name, last_name required).
 */
const { BaseService } = require('./base.service');

class PatientService extends BaseService {
  /** GET /patient?per_page=&page= — paginated list */
  list(query = { per_page: 10, page: 1 }) {
    return this.get('/patient', { query });
  }

  /**
   * POST /patient (multipart). Accepts plain object, sent as multipart.
   * Required: first_name, last_name. Optional: mobile_no, gender, address...
   */
  create(payload) {
    return this.post('/patient', { multipart: payload });
  }

  /** GET /patient/{id} */
  show(id) {
    return this.get(`/patient/${id}`);
  }

  /**
   * POST /patient/{id} — update uses POST, not PUT (verified live:
   * PUT returns 405 "method is not supported"). Requires full payload
   * incl. mobile_no, registration_date, hnr_name.
   */
  update(id, payload) {
    return this.post(`/patient/${id}`, { multipart: payload });
  }

  /** DELETE /patient/{id} — operationId patient.delete */
  remove(id) {
    return this.delete(`/patient/${id}`);
  }

  /** GET /patient/search?search= */
  search(term) {
    return this.get('/patient/search', { query: { search: term } });
  }
}

module.exports = { PatientService };
