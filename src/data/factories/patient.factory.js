/**
 * Patient payload factory — faker-based, unique per run.
 * Indian mobile pattern required by API: ^(?:\+?91|0)?[6-9]\d{9}$
 */
const { faker } = require('@faker-js/faker');

function uniqueMobile() {
  // 6-9 + 9 random digits = valid 10-digit Indian mobile.
  const first = faker.helpers.arrayElement(['6', '7', '8', '9']);
  let rest = '';
  for (let i = 0; i < 9; i++) rest += faker.number.int({ min: 0, max: 9 }).toString();
  return `${first}${rest}`;
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function buildPatient(overrides = {}) {
  return {
    first_name: faker.person.firstName().slice(0, 50),
    last_name: faker.person.lastName().slice(0, 50),
    mobile_no: uniqueMobile(),
    // Required by live API despite docs marking some optional:
    // missing registration_date -> 500; missing hnr_name -> 500 (server bug, guarded by tests).
    registration_date: todayYmd(),
    hnr_name: 1,
    ...overrides,
  };
}

module.exports = { buildPatient, uniqueMobile };
