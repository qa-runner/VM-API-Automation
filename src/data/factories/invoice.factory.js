/**
 * Invoice payload factory — returns FLAT multipart fields.
 * Required: invoice_number, invoice_date, client_id, branch_id, items[0][...].
 * client/branch 8 are the authenticated user's context (from GET /user).
 */
const { faker } = require('@faker-js/faker');

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function buildInvoice(overrides = {}) {
  const n = faker.number.int({ min: 10000, max: 99999 });
  const fields = {
    invoice_number: `INV-AUTO-${Date.now()}-${n}`,
    invoice_date: todayYmd(),
    client_id: 8,
    branch_id: 8,
    'items[0][title]': 'Consultation Fee',
    'items[0][description]': 'Automated test item',
    'items[0][quantity]': 1,
    'items[0][unit_price]': 500,
    'items[0][net_amount]': 500,
    ...overrides,
  };
  return fields;
}

module.exports = { buildInvoice, todayYmd };
