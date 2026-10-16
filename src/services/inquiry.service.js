/**
 * InquiryService — wraps Inquiry tag.
 * POST /inquiries is multipart (JSON body rejected with "date required").
 * No DELETE endpoint exists — created inquiries are left in place.
 */
const { BaseService } = require('./base.service');

class InquiryService extends BaseService {
  /** GET /inquiries?page=&per_page= */
  list(query = { page: 1, per_page: 5 }) {
    return this.get('/inquiries', { query });
  }

  /** POST /inquiries (multipart: date, name required). */
  create(fields) {
    return this.post('/inquiries', { multipart: fields });
  }

  /** GET /inquiries/{id} */
  show(id) {
    return this.get(`/inquiries/${id}`);
  }

  /** POST /inquiries/{id} — update uses POST, not PUT (verified live). */
  update(id, fields) {
    return this.post(`/inquiries/${id}`, { multipart: fields });
  }

  /** GET /inquiries/{id}/followups */
  followups(id) {
    return this.get(`/inquiries/${id}/followups`);
  }

  /** POST /inquiries/{id}/followups — JSON {followup_date, remarks?}. */
  addFollowup(id, payload) {
    return this.post(`/inquiries/${id}/followups`, { body: payload });
  }

  /** POST /inquiries/{id}/stage — JSON {pipeline_stage 0-8}. */
  updateStage(id, stage) {
    return this.post(`/inquiries/${id}/stage`, { body: { pipeline_stage: stage } });
  }

  /** POST /inquiries/{id}/priority — JSON {priority 0-2}. */
  updatePriority(id, priority) {
    return this.post(`/inquiries/${id}/priority`, { body: { priority } });
  }

  /** POST /inquiries/{id}/convert-patient — JSON {patient_id}. */
  convertToPatient(id, patientId) {
    return this.post(`/inquiries/${id}/convert-patient`, { body: { patient_id: patientId } });
  }

  /** POST /inquiries/{id}/convert-appointment — JSON {appointment_id}. */
  convertToAppointment(id, appointmentId) {
    return this.post(`/inquiries/${id}/convert-appointment`, { body: { appointment_id: appointmentId } });
  }

  /** GET /inquiries/pipeline */
  pipeline() {
    return this.get('/inquiries/pipeline');
  }

  /** GET /inquiries/report */
  report(query = { per_page: 5, page: 1 }) {
    return this.get('/inquiries/report', { query });
  }

  /** GET /inquiry/search?query= (singular path — verified live). */
  search(query) {
    return this.get('/inquiry/search', { query: { query } });
  }
}

module.exports = { InquiryService };
