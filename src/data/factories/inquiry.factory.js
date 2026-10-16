/**
 * Inquiry payload factory. Required: date (Y-m-d), name.
 * Phone uses valid Indian-mobile pattern.
 */
const { faker } = require('@faker-js/faker');

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function uniqueMobile() {
  const first = faker.helpers.arrayElement(['6', '7', '8', '9']);
  let rest = '';
  for (let i = 0; i < 9; i++) rest += faker.number.int({ min: 0, max: 9 }).toString();
  return `${first}${rest}`;
}

function buildInquiry(overrides = {}) {
  return {
    date: todayYmd(),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`.slice(0, 60),
    phone: uniqueMobile(),
    ...overrides,
  };
}

module.exports = { buildInquiry, todayYmd, uniqueMobile };
