/**
 * BaseService — parent of every domain service.
 * Holds the ApiClient + helpers so each service is ~30 lines:
 *   class PatientService extends BaseService { create(payload) { ... } }
 */
const { ApiClient } = require('../client/api-client');

class BaseService {
  /** @param {ApiClient} api */
  constructor(api) {
    this.api = api;
  }

  async _read(response) {
    return ApiClient.readJson(response);
  }

  get(path, options) {
    return this.api.get(path, options).then((r) => this._read(r));
  }
  post(path, options) {
    return this.api.post(path, options).then((r) => this._read(r));
  }
  put(path, options) {
    return this.api.put(path, options).then((r) => this._read(r));
  }
  patch(path, options) {
    return this.api.patch(path, options).then((r) => this._read(r));
  }
  delete(path, options) {
    return this.api.delete(path, options).then((r) => this._read(r));
  }
}

module.exports = { BaseService };
