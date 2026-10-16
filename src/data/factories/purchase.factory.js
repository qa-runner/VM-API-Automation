/**
 * Purchase payload factory. Verified live: supplier 3, receiver 9,
 * medicine 1 + company 1, batch/qty/rate/line_total per item.
 */
const { faker } = require('@faker-js/faker');

function buildPurchaseBill(overrides = {}) {
  const qty = 10;
  const rate = 50;
  return {
    bill_number: `PB-AUTO-${Date.now()}-${faker.number.int({ min: 1000, max: 9999 })}`,
    bill_date: '2026-10-16',
    supplier_id: 3,
    receiver_user_id: 9,
    final_total: qty * rate,
    items: [{ medicine_id: 1, company_id: 1, batch_no: `B${faker.number.int({ min: 1000, max: 9999 })}`, qty, rate, line_total: qty * rate }],
    ...overrides,
  };
}

function buildSupplier(overrides = {}) {
  return {
    name: `Auto Supplier ${faker.number.int({ min: 1000, max: 9999 })}`,
    company_name: 'Auto Pharma',
    phone: '9876543210',
    address: 'Test Street',
    ...overrides,
  };
}

module.exports = { buildPurchaseBill, buildSupplier };
