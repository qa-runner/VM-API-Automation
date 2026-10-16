/**
 * MiscService — wraps Wallet, Subscription, Payment Receipt, Habits tags.
 * All read-only except habits (POST JSON, update POST, PUT → 405).
 * Habit missing show / re-delete → 500 bugs (should be 404).
 */
const { BaseService } = require('./base.service');

class MiscService extends BaseService {
  /** GET /wallet */
  wallet() {
    return this.get('/wallet');
  }

  /** GET /my-subscription */
  subscription() {
    return this.get('/my-subscription');
  }

  /** GET /payment-receipt/{id} */
  receipt(id) {
    return this.get(`/payment-receipt/${id}`);
  }

  /** POST /setting/habits — {name}; returns 201. */
  createHabit(payload) {
    return this.post('/setting/habits', { body: payload });
  }

  /** GET /setting/habits */
  listHabits() {
    return this.get('/setting/habits');
  }

  /** GET /setting/habits/{id} — missing 500s. */
  showHabit(id) {
    return this.get(`/setting/habits/${id}`);
  }

  /** POST /setting/habits/{id} — update uses POST, not PUT. */
  updateHabit(id, payload) {
    return this.post(`/setting/habits/${id}`, { body: payload });
  }

  /** DELETE /setting/habits/{id} — re-delete 500s. */
  removeHabit(id) {
    return this.delete(`/setting/habits/${id}`);
  }
}

module.exports = { MiscService };
