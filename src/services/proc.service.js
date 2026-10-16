/**
 * ProcService — wraps Purchase Orders + Purchase Returns tags.
 * Orders are POST JSON (supplier_id, po_date, status, generated_by,
 * ship_to_branch_id, items[]). Update is POST (PUT → 405).
 * Convert: POST /purchase-order/{id}/create-bill → 201 linked bill.
 * Returns: POST /purchase-return/item-action (bill+item ids, new_qty).
 * No return delete endpoint (rows retained).
 */
const { BaseService } = require('./base.service');

class ProcService extends BaseService {
  /** POST /purchase-order (JSON) — returns 201. */
  createOrder(payload) {
    return this.post('/purchase-order', { body: payload });
  }

  /** GET /purchase-order */
  listOrders(query = {}) {
    return this.get('/purchase-order', { query });
  }

  /** GET /purchase-order/{id} */
  showOrder(id) {
    return this.get(`/purchase-order/${id}`);
  }

  /** POST /purchase-order/{id} — update uses POST, not PUT. */
  updateOrder(id, payload) {
    return this.post(`/purchase-order/${id}`, { body: payload });
  }

  /** DELETE /purchase-order/{id} */
  removeOrder(id) {
    return this.delete(`/purchase-order/${id}`);
  }

  /** GET /purchase-order/{id}/prefill */
  prefillOrder(id) {
    return this.get(`/purchase-order/${id}/prefill`);
  }

  /** POST /purchase-order/{id}/create-bill — no body needed. */
  orderToBill(id) {
    return this.post(`/purchase-order/${id}/create-bill`);
  }

  /** POST /purchase-return/item-action — {purchase_bill_id, purchase_bill_item_id, reason, qty, new_qty}. */
  returnItem(payload) {
    return this.post('/purchase-return/item-action', { body: payload });
  }

  /** GET /purchase-return */
  listReturns() {
    return this.get('/purchase-return');
  }

  /** GET /purchase-return/{id} */
  showReturn(id) {
    return this.get(`/purchase-return/${id}`);
  }

  /** GET /purchase-return/by-bill/{billId} */
  returnsByBill(billId) {
    return this.get(`/purchase-return/by-bill/${billId}`);
  }
}

module.exports = { ProcService };
