/**
 * ClinicalService — wraps Symptoms, Diagnosis, Consultation Department masters.
 * Symptoms: POST JSON returns 201 with id; update POST (PUT → 405);
 * missing show → 404 (proper). Diagnosis: create 200; missing show → 200 quirk.
 * Departments: create 201 WITHOUT id (locate via list); update POST.
 */
const { BaseService } = require('./base.service');

class ClinicalService extends BaseService {
  /** POST /setting/symptoms — {name}; returns 201 with id. */
  createSymptom(payload) {
    return this.post('/setting/symptoms', { body: payload });
  }

  /** GET /setting/symptoms */
  listSymptoms() {
    return this.get('/setting/symptoms');
  }

  /** GET /setting/symptoms/{id} */
  showSymptom(id) {
    return this.get(`/setting/symptoms/${id}`);
  }

  /** POST /setting/symptoms/{id} — update uses POST, not PUT. */
  updateSymptom(id, payload) {
    return this.post(`/setting/symptoms/${id}`, { body: payload });
  }

  /** DELETE /setting/symptoms/{id} */
  removeSymptom(id) {
    return this.delete(`/setting/symptoms/${id}`);
  }

  /** POST /setting/diagnosis — {name}. */
  createDiagnosis(payload) {
    return this.post('/setting/diagnosis', { body: payload });
  }

  /** GET /setting/diagnosis */
  listDiagnosis() {
    return this.get('/setting/diagnosis');
  }

  /** GET /setting/diagnosis/{id} — missing returns 200 quirk. */
  showDiagnosis(id) {
    return this.get(`/setting/diagnosis/${id}`);
  }

  /** DELETE /setting/diagnosis/{id} */
  removeDiagnosis(id) {
    return this.delete(`/setting/diagnosis/${id}`);
  }

  /** POST /setting/consultation-department — {name}; returns 201 WITHOUT id. */
  createDepartment(payload) {
    return this.post('/setting/consultation-department', { body: payload });
  }

  /** GET /setting/consultation-department */
  listDepartments() {
    return this.get('/setting/consultation-department');
  }

  /** GET /setting/consultation-department/{id} — missing returns 200 quirk. */
  showDepartment(id) {
    return this.get(`/setting/consultation-department/${id}`);
  }

  /** POST /setting/consultation-department/{id} — update uses POST. */
  updateDepartment(id, payload) {
    return this.post(`/setting/consultation-department/${id}`, { body: payload });
  }

  /** DELETE /setting/consultation-department/{id} */
  removeDepartment(id) {
    return this.delete(`/setting/consultation-department/${id}`);
  }

  /** POST /setting/modern-diagnosis — {name}. */
  createModernDiagnosis(payload) {
    return this.post('/setting/modern-diagnosis', { body: payload });
  }

  /** GET /setting/modern-diagnosis */
  listModernDiagnosis() {
    return this.get('/setting/modern-diagnosis');
  }

  /** GET /setting/modern-diagnosis/{id} — missing returns 200 quirk. */
  showModernDiagnosis(id) {
    return this.get(`/setting/modern-diagnosis/${id}`);
  }

  /** POST /setting/modern-diagnosis/{id} — update uses POST, not PUT. */
  updateModernDiagnosis(id, payload) {
    return this.post(`/setting/modern-diagnosis/${id}`, { body: payload });
  }

  /** DELETE /setting/modern-diagnosis/{id} */
  removeModernDiagnosis(id) {
    return this.delete(`/setting/modern-diagnosis/${id}`);
  }

  /** POST /setting/modern-system — {name}. */
  createModernSystem(payload) {
    return this.post('/setting/modern-system', { body: payload });
  }

  /** GET /setting/modern-system */
  listModernSystems() {
    return this.get('/setting/modern-system');
  }

  /** GET /setting/modern-system/{id} — missing returns 200 quirk. */
  showModernSystem(id) {
    return this.get(`/setting/modern-system/${id}`);
  }

  /** DELETE /setting/modern-system/{id} */
  removeModernSystem(id) {
    return this.delete(`/setting/modern-system/${id}`);
  }
}

module.exports = { ClinicalService };
