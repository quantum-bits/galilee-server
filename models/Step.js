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
                        from: 'application_step.step_id',
                        to: 'application_step.application_id'
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
