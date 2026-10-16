/**
 * MedBillService — wraps Patient Medicine Bills tag.
 * Create/update are POST JSON {patient_id, patient_name, date, slots[]}.
 * Validation failures return 400 (not 422). Missing show → 404 (proper).
 * No delete endpoint (bills retained). PUT → 405.
 */
const { BaseService } = require('./base.service');

class MedBillService extends BaseService {
  /** POST /patient/medicine-bill (JSON) — auto-creates invoice + stock moves. */
  create(payload) {
    return this.post('/patient/medicine-bill', { body: payload });
  }

  /** GET /patient/medicine-bill/{id} */
  show(id) {
    return this.get(`/patient/medicine-bill/${id}`);
  }

  /** POST /patient/medicine-bill/{id} — update uses POST, not PUT. */
  update(id, payload) {
    return this.post(`/patient/medicine-bill/${id}`, { body: payload });
  }
}

module.exports = { MedBillService };
