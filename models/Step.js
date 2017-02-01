'use strict';

const db = require('../db');

class Step extends db.Model {
    static get tableName() {
        return 'step';
    }

    static get relationMappings() {
        return {
            applications: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Application',
                join: {
                    from: 'step.id',
                    through: {
                        from: 'applicationStep.stepId',
                        to: 'applicationStep.applicationId'
                    },
                    to: 'application.id'
                }
            },
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'step.id',
                    through: {
                        from: 'stepResource.stepId',
                        to: 'stepResource.resourceId'
                    },
                    to: 'resource.id'
                }
            }
        }
    }

}

module.exports = Step;
