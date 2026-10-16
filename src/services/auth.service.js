/**
 * AuthService — wraps /login, /user, /auth/me, /logout.
 * Raw ApiClient is used for negative tests (no token needed).
 */
const { BaseService } = require('./base.service');

class AuthService extends BaseService {
  /** POST /login */
  login(payload) {
    return this.post('/login', { body: payload });
  }

  /** GET /user (current user, Bearer required) */
  me() {
    return this.get('/user');
  }

  /** GET /auth/me (alias of /user) */
  meAlias() {
    return this.get('/auth/me');
  }

  /** POST /logout */
  logout() {
    return this.post('/logout');
  }
}

module.exports = { AuthService };
