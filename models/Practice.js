'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            guidance: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'practice.id',
                    to: 'guidance.practiceId'
                }
            }
        }
    }

}

module.exports = Practice;
