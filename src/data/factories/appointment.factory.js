/**
 * Appointment payload factory.
 * Live API requires multipart/form-data with:
 *   date, start_time, end_time, duration, type (0=Consultation),
 *   patient_name, mobile_no, doctor_id[], consultation_department_id[].
 * Valid reference pair from GET /appointments: doctor 9 + department 8.
 */
const { faker } = require('@faker-js/faker');

function uniqueMobile() {
  const first = faker.helpers.arrayElement(['6', '7', '8', '9']);
  let rest = '';
  for (let i = 0; i < 9; i++) rest += faker.number.int({ min: 0, max: 9 }).toString();
  return `${first}${rest}`;
}

function buildAppointment(overrides = {}) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yyyyMmDd = tomorrow.toISOString().slice(0, 10);
  return {
    date: yyyyMmDd,
    start_time: '10:00',
    end_time: '10:30',
    duration: 30,
    type: 0,
    patient_name: `${faker.person.firstName()} ${faker.person.lastName()}`.slice(0, 60),
    mobile_no: uniqueMobile(),
    'doctor_id[]': 9,
    'consultation_department_id[]': 8,
    remarks: faker.lorem.sentence().slice(0, 120),
    ...overrides,
  };
}

module.exports = { buildAppointment, uniqueMobile };
