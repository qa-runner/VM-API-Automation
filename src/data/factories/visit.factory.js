/**
 * Visit payload factory. Live API requires case_id + patient_id + date +
 * next_followup_date (missing next_followup_date 500s — server bug).
 */
function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function inDays(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function buildVisit(caseId, patientId, overrides = {}) {
  return {
    case_id: caseId,
    patient_id: patientId,
    date: todayYmd(),
    next_followup_date: inDays(7),
    doctor_id: 9,
    ...overrides,
  };
}

module.exports = { buildVisit, todayYmd, inDays };
