/**
 * InvoiceService — wraps Invoices tag.
 * Live API requires multipart/form-data with array fields as
 * items[0][title], items[0][quantity], ... (JSON body is rejected).
 */
const { BaseService } = require('./base.service');

class InvoiceService extends BaseService {
  /** GET /invoice?page=&per_page= */
  list(query = { page: 1, per_page: 5 }) {
    return this.get('/invoice', { query });
  }

  /**
   * POST /invoice (multipart).
   * @param {object} fields flat multipart fields incl. 'items[0][title]' style keys.
   */
  create(fields) {
    return this.post('/invoice', { multipart: fields });
  }

  /** GET /invoice/{id} — returns 200 + [] when missing (API quirk). */
  show(id) {
    return this.get(`/invoice/${id}`);
  }

  /**
   * POST /invoice/{id} — update uses POST multipart, not PUT (PUT → 405).
   * Requires full payload incl. items (verified live).
   */
  update(id, fields) {
    return this.post(`/invoice/${id}`, { multipart: fields });
  }

  /**
   * POST /invoice/{id}/pay — JSON body {amount, payment_date, payment_mode}.
   * Only pending/partial invoices can be paid; paid/cancelled → 422.
   */
  pay(id, payload) {
    return this.post(`/invoice/${id}/pay`, { body: payload });
  }

  /** POST /invoice/cancel/{id} — missing id returns 422 (not 404). */
  cancel(id) {
    return this.post(`/invoice/cancel/${id}`);
  }

  /**
   * POST /invoice/refund — JSON {invoice_id, amount, date, payment_mode}.
   * Lethal quirk: amounts exceeding the invoice total are accepted.
   */
  refund(payload) {
    return this.post('/invoice/refund', { body: payload });
  }

  /** DELETE /invoice/{id} */
  remove(id) {
    return this.delete(`/invoice/${id}`);
  }
}

module.exports = { InvoiceService };
