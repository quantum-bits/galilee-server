'use strict';

const db = require('../db');

class Resource extends db.Model {
    static get tableName() {
        return 'resource';
    }

    static get relationMappings() {
        return {
            tags: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Tag',
                join: {
                    from: 'resource.id',
                    through: {
                        from: 'resourceTag.resourceId',
                        to: 'resourceTag.tagId'
                    },
                    to: 'tag.id'
                }
            },
            type: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ResourceType',
                join: {
                    from: 'resource.resourceTypeId',
                    to: 'resourceType.id'
                }
            },
            steps: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'resource.id',
                    through: {
                        from: 'stepResource.resourceId',
                        to: 'stepResource.stepId'
                    },
                    to: 'step.id'
                }
            }
        }
    }

}

module.exports = Resource;
