'use strict';

const db = require('../db');

class PracticeDetail extends db.Model {
    static get tableName() {
        return 'practice_detail';
    }
}

module.exports = PracticeDetail;
