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
}

module.exports = Config;
