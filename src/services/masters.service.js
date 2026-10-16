/**
 * MastersService — wraps Lead Source + Expense Category master tags.
 * Both are POST JSON (unique names enforced → 422 on dup; missing name → 422).
 * Lead updates accept PUT and POST. Missing show/delete → proper 404s.
 */
const { BaseService } = require('./base.service');

class MastersService extends BaseService {
  /** POST /setting/lead-source — {name} unique. */
  createLeadSource(payload) {
    return this.post('/setting/lead-source', { body: payload });
  }

  /** GET /setting/lead-source */
  listLeadSources(query = {}) {
    return this.get('/setting/lead-source', { query });
  }

  /** GET /setting/lead-source/{id} */
  showLeadSource(id) {
    return this.get(`/setting/lead-source/${id}`);
  }

  /** PUT /setting/lead-source/{id} (PUT works here — first PUT-able update). */
  updateLeadSource(id, payload) {
    return this.put(`/setting/lead-source/${id}`, { body: payload });
  }

  /** DELETE /setting/lead-source/{id} */
  removeLeadSource(id) {
    return this.delete(`/setting/lead-source/${id}`);
  }

  /** POST /setting/expense-category — {name} unique. */
  createExpenseCategory(payload) {
    return this.post('/setting/expense-category', { body: payload });
  }

  /** GET /setting/expense-category */
  listExpenseCategories() {
    return this.get('/setting/expense-category');
  }

  /** GET /setting/expense-category/{id} */
  showExpenseCategory(id) {
    return this.get(`/setting/expense-category/${id}`);
  }

  /** DELETE /setting/expense-category/{id} */
  removeExpenseCategory(id) {
    return this.delete(`/setting/expense-category/${id}`);
  }

  /** POST /setting/therapy-category — {name}; duplicates allowed (quirk). */
  createTherapyCategory(payload) {
    return this.post('/setting/therapy-category', { body: payload });
  }

  /** GET /setting/therapy-category */
  listTherapyCategories() {
    return this.get('/setting/therapy-category');
  }

  /** GET /setting/therapy-category/{id} */
  showTherapyCategory(id) {
    return this.get(`/setting/therapy-category/${id}`);
  }

  /** POST /setting/therapy-category/{id} — update uses POST, not PUT. */
  updateTherapyCategory(id, payload) {
    return this.post(`/setting/therapy-category/${id}`, { body: payload });
  }

  /** DELETE /setting/therapy-category/{id} */
  removeTherapyCategory(id) {
    return this.delete(`/setting/therapy-category/${id}`);
  }

  /** POST /setting/therapy-room — {name}. */
  createTherapyRoom(payload) {
    return this.post('/setting/therapy-room', { body: payload });
  }

  /** GET /setting/therapy-room */
  listTherapyRooms() {
    return this.get('/setting/therapy-room');
  }

  /** GET /setting/therapy-room/{id} */
  showTherapyRoom(id) {
    return this.get(`/setting/therapy-room/${id}`);
  }

  /** DELETE /setting/therapy-room/{id} */
  removeTherapyRoom(id) {
    return this.delete(`/setting/therapy-room/${id}`);
  }

  /** GET /pincode/suggest?q= (2-10 chars). */
  pincodeSuggest(q) {
    return this.get('/pincode/suggest', { query: { q } });
  }

  /** POST /setting/certificate-type — {title, code, body_template}; returns 201. */
  createCertificateType(payload) {
    return this.post('/setting/certificate-type', { body: payload });
  }

  /** GET /setting/certificate-type */
  listCertificateTypes() {
    return this.get('/setting/certificate-type');
  }

  /** GET /setting/certificate-type/{id} */
  showCertificateType(id) {
    return this.get(`/setting/certificate-type/${id}`);
  }

  /** POST /setting/certificate-type/{id} — update uses POST, not PUT. */
  updateCertificateType(id, payload) {
    return this.post(`/setting/certificate-type/${id}`, { body: payload });
  }

  /** DELETE /setting/certificate-type/{id} */
  removeCertificateType(id) {
    return this.delete(`/setting/certificate-type/${id}`);
  }

  /** POST /setting/source-panel — {name} unique. */
  createSourcePanel(payload) {
    return this.post('/setting/source-panel', { body: payload });
  }

  /** GET /setting/source-panel */
  listSourcePanels() {
    return this.get('/setting/source-panel');
  }

  /** GET /setting/source-panel/{id} */
  showSourcePanel(id) {
    return this.get(`/setting/source-panel/${id}`);
  }

  /** PUT /setting/source-panel/{id} (PUT works here). */
  updateSourcePanelPut(id, payload) {
    return this.put(`/setting/source-panel/${id}`, { body: payload });
  }

  /** POST /setting/source-panel/{id} (POST works too). */
  updateSourcePanel(id, payload) {
    return this.post(`/setting/source-panel/${id}`, { body: payload });
  }

  /** DELETE /setting/source-panel/{id} */
  removeSourcePanel(id) {
    return this.delete(`/setting/source-panel/${id}`);
  }

  /** GET /calendar/settings */
  calendarSettings() {
    return this.get('/calendar/settings');
  }

  /** GET /setting/consultation-settings */
  consultationSettings() {
    return this.get('/setting/consultation-settings');
  }

  /** POST /setting/special-case — {name} unique. */
  createSpecialCase(payload) {
    return this.post('/setting/special-case', { body: payload });
  }

  /** GET /setting/special-case */
  listSpecialCases() {
    return this.get('/setting/special-case');
  }

  /** GET /setting/special-case/{id} */
  showSpecialCase(id) {
    return this.get(`/setting/special-case/${id}`);
  }

  /** PUT /setting/special-case/{id} (PUT works here). */
  updateSpecialCasePut(id, payload) {
    return this.put(`/setting/special-case/${id}`, { body: payload });
  }

  /** POST /setting/special-case/{id} (POST works too). */
  updateSpecialCase(id, payload) {
    return this.post(`/setting/special-case/${id}`, { body: payload });
  }

  /** DELETE /setting/special-case/{id} */
  removeSpecialCase(id) {
    return this.delete(`/setting/special-case/${id}`);
  }

  /** POST /setting/medicine-type — {name}; dup replaces existing row (quirk). */
  createMedicineType(payload) {
    return this.post('/setting/medicine-type', { body: payload });
  }

  /** GET /setting/medicine-type */
  listMedicineTypes() {
    return this.get('/setting/medicine-type');
  }

  /** GET /setting/medicine-type/{id} */
  showMedicineType(id) {
    return this.get(`/setting/medicine-type/${id}`);
  }

  /** PUT /setting/medicine-type/{id} (PUT works here). */
  updateMedicineTypePut(id, payload) {
    return this.put(`/setting/medicine-type/${id}`, { body: payload });
  }

  /** POST /setting/medicine-type/{id} (POST works too). */
  updateMedicineType(id, payload) {
    return this.post(`/setting/medicine-type/${id}`, { body: payload });
  }

  /** DELETE /setting/medicine-type/{id} */
  removeMedicineType(id) {
    return this.delete(`/setting/medicine-type/${id}`);
  }

  /** POST /setting/company — {name}. */
  createCompany(payload) {
    return this.post('/setting/company', { body: payload });
  }

  /** GET /setting/company */
  listCompanies() {
    return this.get('/setting/company');
  }

  /** GET /setting/company/{id} */
  showCompany(id) {
    return this.get(`/setting/company/${id}`);
  }

  /** PUT /setting/company/{id} (PUT works here). */
  updateCompanyPut(id, payload) {
    return this.put(`/setting/company/${id}`, { body: payload });
  }

  /** POST /setting/company/{id} (POST works too). */
  updateCompany(id, payload) {
    return this.post(`/setting/company/${id}`, { body: payload });
  }

  /** DELETE /setting/company/{id} */
  removeCompany(id) {
    return this.delete(`/setting/company/${id}`);
  }
}

module.exports = { MastersService };
