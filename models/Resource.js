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
                        from: 'resource_tag.resource_id',
                        to: 'resource_tag.tag_id'
                    },
                    to: 'tag.id'
                }
            },
            type: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ResourceType',
                join: {
                    from: 'resource.resource_type_id',
                    to: 'resource_type.id'
                }
            },
            steps: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'resource.id',
                    through: {
                        from: 'step_resource.resource_id',
                        to: 'step_resource.step_id'
                    },
                    to: 'step.id'
                }
            }
        }
    }

}

module.exports = Resource;
