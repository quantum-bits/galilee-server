'use strict';

const db = require('../db');

class ResourceType extends db.Model {
    static get tableName() {
        return 'resource_type';
    }
    
    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'resource_type.id',
                    to: 'resource.resource_type_id'
                }
            }
        }
    }
}

module.exports = ResourceType;
