const fs = require('fs');

class MiniDb {
  constructor(name) {
		this.basePath = `${__dirname}/data/`;

    if (!fs.existsSync(this.basePath)){
      console.log('[TwitchMonitor]', 'Création du dossier pour minidb:', this.basePath);
      fs.mkdirSync(this.basePath);
    }

    this.basePath = `${__dirname}/data/${name}`;

    if (!fs.existsSync(this.basePath)){
      console.log('[TwitchMonitor]', 'Création du dossier pour minidb:', this.basePath);
      fs.mkdirSync(this.basePath);
    }
  }

  get(id) {
    const filePath = `${this.basePath}/${id}.json`;

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, {
          encoding: 'utf8',
          flag: 'r'
        });
        return JSON.parse(raw) || null;
      }
    } catch (e) {
      console.error('[TwitchMonitor]', 'Erreur d\'écriture:', filePath, e);
    }
    return null;
  }

  put(id, value) {
    const filePath = `${this.basePath}/${id}.json`;

    try {
      const raw = JSON.stringify(value);
      fs.writeFileSync(filePath, raw, {
        encoding: 'utf8',
        mode: '666',
        flag: 'w'
      });
      return true;
    } catch (e) {
      console.error('[TwitchMonitor]', 'Erreur d\'écriture:', filePath, e);
      return false;
    }
  }
}

module.exports = MiniDb;