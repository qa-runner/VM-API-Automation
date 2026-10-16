/**
 * VisitService — wraps Patient Visit tag.
 * Create is multipart (case_id, patient_id, date, next_followup_date required;
 * missing next_followup_date 500s — server bug). Create returns HTTP 201.
 * Update is POST multipart (PUT → 405). Missing show/detail → 500 (not 404).
 */
const { BaseService } = require('./base.service');

class VisitService extends BaseService {
  /** POST /patient/visit (multipart) — returns 201 on success. */
  create(fields) {
    return this.post('/patient/visit', { multipart: fields });
  }

  /** GET /patient/visit/list/{case_id} */
  listByCase(caseId) {
    return this.get(`/patient/visit/list/${caseId}`);
  }

  /** GET /patient/visit/{id} — missing id 500s (should be 404). */
  show(id) {
    return this.get(`/patient/visit/${id}`);
  }

  /** GET /patient/visit/detail/{id} */
  details(id) {
    return this.get(`/patient/visit/detail/${id}`);
  }

  /** POST /patient/visit/{id} — update uses POST, not PUT. */
  update(id, fields) {
    return this.post(`/patient/visit/${id}`, { multipart: fields });
  }

  /** DELETE /patient/visit/{id} — re-delete 500s. */
  remove(id) {
    return this.delete(`/patient/visit/${id}`);
  }

  /** POST /patient/{patientId}/case — JSON {department_id}. */
  createCase(patientId, payload = {}) {
    return this.post(`/patient/${patientId}/case`, { body: payload });
  }
}

module.exports = { VisitService };
