'use strict';

const db = require('../db');

class StampedModel extends db.Model {
    $beforeUpdate() {
        this.updatedAt = new Date().toISOString();
    };
}

module.exports = StampedModel;