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
}

module.exports = Config;
