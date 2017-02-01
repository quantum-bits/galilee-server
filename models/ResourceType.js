'use strict';

const db = require('../db');

class ResourceType extends db.Model {
    static get tableName() {
        return 'resourceType';
    }
    
    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'resourceType.id',
                    to: 'resource.resourceTypeId'
                }
            }
        }
    }
}

module.exports = ResourceType;
