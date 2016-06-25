'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            details: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/PracticeDetail',
                join: {
                    from: 'practice.id',
                    to: 'practice_detail.practice_id'
                }
            }
        }
    }

}

module.exports = Practice;
