/**
 * PurchaseService — wraps Purchase Bills + Suppliers tags.
 * Bills are POST JSON (supplier_id, receiver_user_id=9, final_total,
 * items[{medicine_id, company_id, batch_no, qty, rate, line_total}]).
 * Create/delete return 201/200; missing show/delete → 404 (proper).
 * Update is POST (PUT → 405). Pay: POST /purchases/{id}/pay JSON
 * {paid_amount, payment_date, payment_mode}.
 */
const { BaseService } = require('./base.service');

class PurchaseService extends BaseService {
  /** POST /purchases (JSON) — returns 201. */
  createBill(payload) {
    return this.post('/purchases', { body: payload });
  }

  /** GET /purchases */
  listBills(query = {}) {
    return this.get('/purchases', { query });
  }

  /** GET /purchases/{id} */
  showBill(id) {
    return this.get(`/purchases/${id}`);
  }

  /** POST /purchases/{id} — update uses POST, not PUT. */
  updateBill(id, payload) {
    return this.post(`/purchases/${id}`, { body: payload });
  }

  /** DELETE /purchases/{id} */
  removeBill(id) {
    return this.delete(`/purchases/${id}`);
  }

  /** POST /purchases/{id}/pay — JSON {paid_amount, payment_date, payment_mode}. */
  payBill(id, payload) {
    return this.post(`/purchases/${id}/pay`, { body: payload });
  }

  /** GET /suppliers */
  listSuppliers() {
    return this.get('/suppliers');
  }

  /** POST /suppliers — JSON {name, company_name, phone, address}; returns 201. */
  createSupplier(payload) {
    return this.post('/suppliers', { body: payload });
  }

  /** GET /suppliers/{id} */
  showSupplier(id) {
    return this.get(`/suppliers/${id}`);
  }
}

module.exports = { PurchaseService };
