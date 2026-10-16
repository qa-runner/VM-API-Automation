/**
 * AppointmentService — wraps Appointments tag endpoints.
 * POST /appointments is JSON (AppointmentRequest).
 */
const { BaseService } = require('./base.service');

class AppointmentService extends BaseService {
  /** GET /appointments */
  list() {
    return this.get('/appointments');
  }

  /**
   * POST /appointments as multipart (live API rejects JSON with
   * "The date field is required" — it only parses multipart).
   */
  create(payload) {
    return this.post('/appointments', { multipart: payload });
  }

  /** GET /appointments/{id} — missing id returns 404 (proper). */
  show(id) {
    return this.get(`/appointments/${id}`);
  }

  /**
   * POST /appointments/{id} — update uses POST multipart, not PUT
   * (verified live: PUT returns 405). Requires full payload.
   */
  update(id, payload) {
    return this.post(`/appointments/${id}`, { multipart: payload });
  }

  /** DELETE /appointments/{id} — missing/deleted id returns 404 (proper). */
  remove(id) {
    return this.delete(`/appointments/${id}`);
  }

  /** GET /appointments/report?start_date=&end_date= */
  report(query = {}) {
    return this.get('/appointments/report', { query });
  }

  /** GET /appointments/by-date?date= */
  byDate(date) {
    return this.get('/appointments/by-date', { query: { date } });
  }

  /** GET /appointments/by-month?month=YYYY-MM */
  byMonth(month) {
    return this.get('/appointments/by-month', { query: { month } });
  }

  /** POST /appointments/{id}/complete */
  complete(id) {
    return this.post(`/appointments/${id}/complete`);
  }
}

module.exports = { AppointmentService };
