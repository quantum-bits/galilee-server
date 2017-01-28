'use strict';

const db = require('../db');

module.exports = class StampedModel extends db.Model {
    $beforeUpdate() {
        this.updated_at = new Date().toISOString();
    };
}
