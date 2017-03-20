'use strict';

const db = require('../db');

class Guidance extends db.Model {
    static get tableName() {
        return 'guidance';
    }

    static get relationMappings() {
        return {
            practice: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'guidance.practiceId',
                    to: 'practice.id'
                }
            },
            steps: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'guidance.id',
                    to: 'step.guidanceId'
                }
            }
        }
    }

}

module.exports = Guidance;
