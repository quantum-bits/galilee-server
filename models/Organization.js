'use strict';

const db = require('../db');

class Organization extends db.Model {
    static get tableName() {
        return 'organization';
    }

    static get relationMappings() {
        return {
            groups: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'organization.id',
                    to: 'group.organization_id'
                }
            }
        }
    }
}

module.exports = Organization;
