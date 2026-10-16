/**
 * FinanceService — wraps Account Income, Account Expenditure, Finance Report,
 * and inventory stock list. All JSON. Updates are POST (PUT → 405).
 * Missing show/delete → 404 (proper). Note: /inventory/low-stock 500s
 * (server bug) and is intentionally NOT covered.
 */
const { BaseService } = require('./base.service');

class FinanceService extends BaseService {
  /** POST /finance/income — {date, subject, amount}. */
  createIncome(payload) {
    return this.post('/finance/income', { body: payload });
  }

  /** GET /finance/income */
  listIncome(query = {}) {
    return this.get('/finance/income', { query });
  }

  /** GET /finance/income/{id} */
  showIncome(id) {
    return this.get(`/finance/income/${id}`);
  }

  /** POST /finance/income/{id} — update uses POST, not PUT. */
  updateIncome(id, payload) {
    return this.post(`/finance/income/${id}`, { body: payload });
  }

  /** DELETE /finance/income/{id} */
  removeIncome(id) {
    return this.delete(`/finance/income/${id}`);
  }

  /** POST /finance/expenditure — {date, category_id, subject, amount}. */
  createExpenditure(payload) {
    return this.post('/finance/expenditure', { body: payload });
  }

  /** GET /finance/expenditure */
  listExpenditure(query = {}) {
    return this.get('/finance/expenditure', { query });
  }

  /** GET /finance/expenditure/{id} */
  showExpenditure(id) {
    return this.get(`/finance/expenditure/${id}`);
  }

  /** DELETE /finance/expenditure/{id} */
  removeExpenditure(id) {
    return this.delete(`/finance/expenditure/${id}`);
  }

  /** GET /finance/summary */
  summary(query = {}) {
    return this.get('/finance/summary', { query });
  }

  /** GET /inventory/stock-values */
  stockList(query = { per_page: 5, page: 1 }) {
    return this.get('/inventory/stock-values', { query });
  }
}

module.exports = { FinanceService };
