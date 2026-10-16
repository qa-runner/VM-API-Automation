/**
 * GeoService — wraps Pincode, Common Lists, billing search tags.
 * All read-only: zero test data created, nothing to clean.
 */
const { BaseService } = require('./base.service');

class GeoService extends BaseService {
  /** GET /pincode/{pincode} */
  pincode(pincode) {
    return this.get(`/pincode/${pincode}`);
  }

  /** GET /country */
  countries() {
    return this.get('/country');
  }

  /** POST /state — {country_id}. */
  states(payload) {
    return this.post('/state', { body: payload });
  }

  /** POST /city — {state_id}. */
  cities(payload) {
    return this.post('/city', { body: payload });
  }

  /** GET /patient/billing-search?search= */
  billingSearch(term) {
    return this.get('/patient/billing-search', { query: { search: term } });
  }
}

module.exports = { GeoService };
