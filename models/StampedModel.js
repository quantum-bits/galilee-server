'use strict';

const db = require('../db');

module.exports = class StampedModel extends db.Model {
    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    };
}
