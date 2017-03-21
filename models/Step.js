'use strict';

const db = require('../db');

class Step extends db.Model {
    static get tableName() {
        return 'step';
    }

    static get relationMappings() {
        return {
            direction: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Direction',
                join: {
                    from: 'step.directionId',
                    to: 'direction.id'
                }
            }
        }
    }
}

module.exports = Step;
