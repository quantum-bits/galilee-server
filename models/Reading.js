'use strict';

const db = require('../db');

class Reading extends db.Model {
    static get tableName() {
        return 'reading';
    }
}

module.exports = Reading;

