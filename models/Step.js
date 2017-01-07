'use strict';

const db = require('../db');

class Step extends db.Model {
    static get tableName() {
        return 'step';
    }

    static get relationMappings() {
        return {
            practice: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'practice_id',
                    to: 'practice.id'
                }
            },
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'reading_id',
                    to: 'reading.id'
                }
            },
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'step.id',
                    through: {
                        from: 'step_resource.step_id',
                        to: 'step_resource.resource_id'
                    },
                    to: 'resource.id'
                }
            }
        }
    }

}

module.exports = Step;
