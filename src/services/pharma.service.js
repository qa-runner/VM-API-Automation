/**
 * PharmaService — wraps Composition + Medicine Unit tags.
 * Compositions are POST JSON (PUT and POST updates both work; dup names
 * accepted without visible second row — upsert quirk). Unit endpoints are
 * read-only (usage_type required).
 */
const { BaseService } = require('./base.service');

class PharmaService extends BaseService {
  /** POST /setting/composition — {name}. */
  createComposition(payload) {
    return this.post('/setting/composition', { body: payload });
  }

  /** GET /setting/composition */
  listCompositions() {
    return this.get('/setting/composition');
  }

  /** GET /setting/composition/{id} */
  showComposition(id) {
    return this.get(`/setting/composition/${id}`);
  }

  /** PUT /setting/composition/{id} (PUT works here). */
  updateCompositionPut(id, payload) {
    return this.put(`/setting/composition/${id}`, { body: payload });
  }

  /** POST /setting/composition/{id} (POST works too). */
  updateComposition(id, payload) {
    return this.post(`/setting/composition/${id}`, { body: payload });
  }

  /** DELETE /setting/composition/{id} */
  removeComposition(id) {
    return this.delete(`/setting/composition/${id}`);
  }

  /** GET /setting/medicine/{id}/resolved-units?usage_type= (required). */
  resolvedUnits(medicineId, usageType) {
    const query = usageType ? { usage_type: usageType } : {};
    return this.get(`/setting/medicine/${medicineId}/resolved-units`, { query });
  }

  /** GET /setting/medicine/unit-defaults */
  unitDefaults(query = {}) {
    return this.get('/setting/medicine/unit-defaults', { query });
  }
}

module.exports = { PharmaService };
