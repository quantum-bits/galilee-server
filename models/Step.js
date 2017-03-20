'use strict';

const db = require('../db');

class Step extends db.Model {
    static get tableName() {
        return 'step';
    }

    static get relationMappings() {
        return {
            guidance: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'step.guidanceId',
                    to: 'guidance.id'
                }
            }
        }
    }
}

module.exports = Step;
