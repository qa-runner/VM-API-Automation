/**
 * BranchDashService — wraps Branches, Dashboard, and waiting list.
 * Branches are multipart (name + trade_name; update POST, PUT → 405;
 * missing show/delete → proper 404s). Dashboard + waiting are read-only.
 */
const { BaseService } = require('./base.service');

class BranchDashService extends BaseService {
  /** POST /branch (multipart). */
  createBranch(fields) {
    return this.post('/branch', { multipart: fields });
  }

  /** GET /branch */
  listBranches() {
    return this.get('/branch');
  }

  /** GET /branch/{id} */
  showBranch(id) {
    return this.get(`/branch/${id}`);
  }

  /** POST /branch/{id} — update uses POST, not PUT. */
  updateBranch(id, fields) {
    return this.post(`/branch/${id}`, { multipart: fields });
  }

  /** DELETE /branch/{id} */
  removeBranch(id) {
    return this.delete(`/branch/${id}`);
  }

  /** GET /patient/dashboard/today-stats */
  todayStats() {
    return this.get('/patient/dashboard/today-stats');
  }

  /** GET /patient/dashboard/day-end-report */
  dayEndReport(query = {}) {
    return this.get('/patient/dashboard/day-end-report', { query });
  }

  /** GET /patient/dashboard/journey-funnel */
  journeyFunnel() {
    return this.get('/patient/dashboard/journey-funnel');
  }

  /** POST /patient/waiting/list — JSON {date}. */
  waitingList(payload) {
    return this.post('/patient/waiting/list', { body: payload });
  }
}

module.exports = { BranchDashService };
