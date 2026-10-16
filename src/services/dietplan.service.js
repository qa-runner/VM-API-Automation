/**
 * DietPlanService — wraps DietPlanCategory, DietPlanItem, FinancialYear tags.
 * Plan categories/items are POST JSON (updates POST, PUT → 405).
 * Item requires required_qty 0|1 (+qty text when 1). Financial years are
 * read-only on purpose (creating years pollutes accounting context).
 */
const { BaseService } = require('./base.service');

class DietPlanService extends BaseService {
  /** POST /setting/diet/plan-categories — {type, title}; returns 201. */
  createPlanCategory(payload) {
    return this.post('/setting/diet/plan-categories', { body: payload });
  }

  /** GET /setting/diet/plan-categories */
  listPlanCategories() {
    return this.get('/setting/diet/plan-categories');
  }

  /** GET /setting/diet/plan-categories/{id} */
  showPlanCategory(id) {
    return this.get(`/setting/diet/plan-categories/${id}`);
  }

  /** POST /setting/diet/plan-categories/{id} — update uses POST, not PUT. */
  updatePlanCategory(id, payload) {
    return this.post(`/setting/diet/plan-categories/${id}`, { body: payload });
  }

  /** DELETE /setting/diet/plan-categories/{id} */
  removePlanCategory(id) {
    return this.delete(`/setting/diet/plan-categories/${id}`);
  }

  /** POST /setting/diet/plan-items — {diet_plan_category_id, title, required_qty 0|1, qty?}. */
  createPlanItem(payload) {
    return this.post('/setting/diet/plan-items', { body: payload });
  }

  /** GET /setting/diet/plan-items */
  listPlanItems() {
    return this.get('/setting/diet/plan-items');
  }

  /** GET /setting/diet/plan-items/{id} */
  showPlanItem(id) {
    return this.get(`/setting/diet/plan-items/${id}`);
  }

  /** POST /setting/diet/plan-items/{id} — update uses POST, not PUT. */
  updatePlanItem(id, payload) {
    return this.post(`/setting/diet/plan-items/${id}`, { body: payload });
  }

  /** DELETE /setting/diet/plan-items/{id} */
  removePlanItem(id) {
    return this.delete(`/setting/diet/plan-items/${id}`);
  }

  /** GET /accounting/financial-years (read-only — year writes pollute accounting). */
  listFinancialYears() {
    return this.get('/accounting/financial-years');
  }

  /** GET /accounting/financial-years/{id} */
  showFinancialYear(id) {
    return this.get(`/accounting/financial-years/${id}`);
  }
}

module.exports = { DietPlanService };
