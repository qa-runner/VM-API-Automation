/**
 * DietService — wraps Habit Options + Language (diet module) tags.
 * Options need a parent habit (create/delete around each test).
 * Updates are POST (PUT → 405). Option missing-show → 500 bug.
 */
const { BaseService } = require('./base.service');

class DietService extends BaseService {
  /** POST /setting/habits-options — {habit_id, name?}; returns 201. */
  createHabitOption(payload) {
    return this.post('/setting/habits-options', { body: payload });
  }

  /** GET /setting/habits-options */
  listHabitOptions() {
    return this.get('/setting/habits-options');
  }

  /** GET /setting/habits-options/{id} — missing 500s. */
  showHabitOption(id) {
    return this.get(`/setting/habits-options/${id}`);
  }

  /** POST /setting/habits-options/{id} — update uses POST, not PUT. */
  updateHabitOption(id, payload) {
    return this.post(`/setting/habits-options/${id}`, { body: payload });
  }

  /** DELETE /setting/habits-options/{id} */
  removeHabitOption(id) {
    return this.delete(`/setting/habits-options/${id}`);
  }

  /** POST /setting/diet/languages — {title, code?}; returns 201. */
  createLanguage(payload) {
    return this.post('/setting/diet/languages', { body: payload });
  }

  /** GET /setting/diet/languages */
  listLanguages() {
    return this.get('/setting/diet/languages');
  }

  /** GET /setting/diet/languages/{id} */
  showLanguage(id) {
    return this.get(`/setting/diet/languages/${id}`);
  }

  /** POST /setting/diet/languages/{id} — update uses POST, not PUT. */
  updateLanguage(id, payload) {
    return this.post(`/setting/diet/languages/${id}`, { body: payload });
  }

  /** DELETE /setting/diet/languages/{id} */
  removeLanguage(id) {
    return this.delete(`/setting/diet/languages/${id}`);
  }
}

module.exports = { DietService };
