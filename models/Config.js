'use strict';

const db = require('../db');

class Config extends db.Model {
    static get tableName() {
        return 'config';
    }
    static get idColumn() {
        return 'key';
    }
}

module.exports = Config;
