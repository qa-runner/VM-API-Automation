/**
 * User/role factories. Department 8 required for user create.
 */
const { faker } = require('@faker-js/faker');

function uniqueMobile() {
  const first = faker.helpers.arrayElement(['6', '7', '8', '9']);
  let rest = '';
  for (let i = 0; i < 9; i++) rest += faker.number.int({ min: 0, max: 9 }).toString();
  return `${first}${rest}`;
}

function buildUser(overrides = {}) {
  const mobile = uniqueMobile();
  return {
    first_name: faker.person.firstName().slice(0, 30),
    mobile_no: mobile,
    email: `staff${mobile}@test.com`,
    department_id: 8,
    ...overrides,
  };
}

function buildRole(overrides = {}) {
  return {
    name: `AutoRole-${Date.now()}-${faker.number.int({ min: 100, max: 999 })}`,
    permissions: { dashboard: { view: true } },
    ...overrides,
  };
}

module.exports = { buildUser, buildRole, uniqueMobile };
