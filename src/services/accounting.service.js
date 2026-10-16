/**
 * AccountingService — wraps AccountGroup, AccountLedger, VoucherType tags.
 * Groups are POST JSON (name + nature asset|income...; invalid → 422).
 * Update is PUT (POST → 405) — inverse of most modules. Bare {data} bodies.
 */
const { BaseService } = require('./base.service');

class AccountingService extends BaseService {
  /** POST /accounting/groups — {name, nature}; returns 201 bare {data}. */
  createGroup(payload) {
    return this.post('/accounting/groups', { body: payload });
  }

  /** GET /accounting/groups */
  listGroups() {
    return this.get('/accounting/groups');
  }

  /** GET /accounting/groups/{id} */
  showGroup(id) {
    return this.get(`/accounting/groups/${id}`);
  }

  /** PUT /accounting/groups/{id} — update uses PUT, not POST. */
  updateGroup(id, payload) {
    return this.put(`/accounting/groups/${id}`, { body: payload });
  }

  /** DELETE /accounting/groups/{id} (system groups → 422). */
  removeGroup(id) {
    return this.delete(`/accounting/groups/${id}`);
  }

  /** GET /accounting/ledgers */
  listLedgers(query = {}) {
    return this.get('/accounting/ledgers', { query });
  }

  /** GET /accounting/ledgers/{id} */
  showLedger(id) {
    return this.get(`/accounting/ledgers/${id}`);
  }

  /** GET /accounting/voucher-types */
  listVoucherTypes() {
    return this.get('/accounting/voucher-types');
  }
}

module.exports = { AccountingService };
