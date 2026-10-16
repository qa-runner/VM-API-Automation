/**
 * DietCatalogService — wraps DietCategory + DietItem tags.
 * Categories: POST JSON returns 201; update POST (PUT → 405); proper 404s.
 * Items: create returns 201 BUT the row never persists (ghost write —
 * show/list never return it); show works only for pre-existing seed rows.
 */
const { BaseService } = require('./base.service');

class DietCatalogService extends BaseService {
  /** POST /setting/diet/categories — {title}; returns 201. */
  createCategory(payload) {
    return this.post('/setting/diet/categories', { body: payload });
  }

  /** GET /setting/diet/categories */
  listCategories() {
    return this.get('/setting/diet/categories');
  }

  /** GET /setting/diet/categories/{id} */
  showCategory(id) {
    return this.get(`/setting/diet/categories/${id}`);
  }

  /** POST /setting/diet/categories/{id} — update uses POST, not PUT. */
  updateCategory(id, payload) {
    return this.post(`/setting/diet/categories/${id}`, { body: payload });
  }

  /** DELETE /setting/diet/categories/{id} */
  removeCategory(id) {
    return this.delete(`/setting/diet/categories/${id}`);
  }

  /** POST /setting/diet/items — {diet_category_id, title}; returns 201 but row is not persisted (ghost write). */
  createItem(payload) {
    return this.post('/setting/diet/items', { body: payload });
  }

  /** GET /setting/diet/items */
  listItems(query = {}) {
    return this.get('/setting/diet/items', { query });
  }

  /** GET /setting/diet/items/{id} — works for seed rows; fresh ids 404. */
  showItem(id) {
    return this.get(`/setting/diet/items/${id}`);
  }
}

module.exports = { DietCatalogService };
