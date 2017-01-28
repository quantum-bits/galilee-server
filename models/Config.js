'use strict';

const db = require('../db');
const Version = require('./Version');

class Config extends db.Model {
    static get tableName() {
        return 'config';
    }

    static get idColumn() {
        return 'key';
    }

    static defaultVersion() {
        return this.query()
            .findById('default-version')
            .then(config => Version.query()
                .where('code', config.value)
                .first());
    }

    static _lookup(key) {
        return this.query()
            .findById(key)
            .then(config => config.value);
    }

    static bgAccessToken() {
        return this._lookup('bg-access-token');
    }

    static uploadRoot() {
        return this._lookup('upload-root');
    }
}

module.exports = Config;
