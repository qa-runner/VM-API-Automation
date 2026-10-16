/**
 * ConfigService — wraps read-mostly branch configuration tags.
 * Writes are covered ONLY where safely round-trippable (medicine-bill save
 * writes back identical values). Numbering/messaging/print templates are
 * read-only on purpose (mutation side effects).
 */
const { BaseService } = require('./base.service');

class ConfigService extends BaseService {
  /** GET /setting/medicine-bill */
  medicineBill() {
    return this.get('/setting/medicine-bill');
  }

  /** POST /setting/medicine-bill */
  saveMedicineBill(payload) {
    return this.post('/setting/medicine-bill', { body: payload });
  }

  /** GET /setting/unique-number */
  uniqueNumbers() {
    return this.get('/setting/unique-number');
  }

  /** GET /setting/message/whatsapp */
  whatsappSettings(query = {}) {
    return this.get('/setting/message/whatsapp', { query });
  }

  /** GET /setting/message/sms */
  smsSettings(query = {}) {
    return this.get('/setting/message/sms', { query });
  }

  /** GET /print/setting */
  printSettings() {
    return this.get('/print/setting');
  }
}

module.exports = { ConfigService };
