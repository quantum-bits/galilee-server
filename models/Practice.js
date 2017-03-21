'use strict';

const db = require('../db');

class Practice extends db.Model {
    static get tableName() {
        return 'practice';
    }

    static get relationMappings() {
        return {
            directions: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Direction',
                join: {
                    from: 'practice.id',
                    to: 'direction.practiceId'
                }
            }
        }
    }
}

module.exports = Practice;
