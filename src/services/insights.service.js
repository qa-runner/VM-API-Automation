/**
 * InsightsService — wraps ActivityLog, Patient Analytics, and search tags.
 * All read-only: zero test data created, nothing to clean.
 */
const { BaseService } = require('./base.service');

class InsightsService extends BaseService {
  /** GET /activity-logs */
  activityLogs(query = { per_page: 5, page: 1 }) {
    return this.get('/activity-logs', { query });
  }

  /** GET /patient/analytics/followup */
  followupAnalytics() {
    return this.get('/patient/analytics/followup');
  }

  /** GET /setting/symptoms/search?query= (query optional). */
  symptomSearch(query) {
    const q = query ? { query } : {};
    return this.get('/setting/symptoms/search', { query: q });
  }

  /** GET /city/search?query= (min 2 chars). */
  citySearch(query) {
    return this.get('/city/search', { query: { query } });
  }
}

module.exports = { InsightsService };
