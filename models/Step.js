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
            },
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'step.id',
                    through: {
                        from: 'stepResource.stepId',
                        to: 'stepResource.resourceId',
                        extra: ['seq', 'description']
                    },
                    to: 'resource.id'
                }
            }

        }
    }
}

module.exports = Step;
