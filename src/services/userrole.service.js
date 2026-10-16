/**
 * UserRoleService — wraps User Management + Role tags.
 * Users are multipart (first_name, mobile/email, department_id=8 required;
 * missing department 500s after partial insert). Update is POST (PUT → 405).
 * Show-missing returns 200-empty quirk. Roles are JSON; permissions must use
 * real module keys (e.g. dashboard); unknown permission 500s (spatie).
 */
const { BaseService } = require('./base.service');

class UserRoleService extends BaseService {
  /** POST /setting/user (multipart). */
  createUser(fields) {
    return this.post('/setting/user', { multipart: fields });
  }

  /** GET /setting/user (no search param — ?search= 500s). */
  listUsers(query = {}) {
    return this.get('/setting/user', { query });
  }

  /** GET /setting/user/{id} */
  showUser(id) {
    return this.get(`/setting/user/${id}`);
  }

  /** POST /setting/user/{id} — update uses POST, not PUT. */
  updateUser(id, fields) {
    return this.post(`/setting/user/${id}`, { multipart: fields });
  }

  /** DELETE /setting/user/{id} */
  removeUser(id) {
    return this.delete(`/setting/user/${id}`);
  }

  /** POST /setting/role — JSON {name, permissions}. */
  createRole(payload) {
    return this.post('/setting/role', { body: payload });
  }

  /** GET /setting/role */
  listRoles() {
    return this.get('/setting/role');
  }

  /** GET /setting/role/{id} — missing → 404 (proper). */
  showRole(id) {
    return this.get(`/setting/role/${id}`);
  }

  /** DELETE /setting/role/{id} */
  removeRole(id) {
    return this.delete(`/setting/role/${id}`);
  }

  /** GET /setting/role/modules */
  roleModules() {
    return this.get('/setting/role/modules');
  }

  /** GET /setting/role/system-roles */
  systemRoles() {
    return this.get('/setting/role/system-roles');
  }
}

module.exports = { UserRoleService };
