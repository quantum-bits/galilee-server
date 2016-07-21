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
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'resource.id',
                    through: {
                        from: 'practice_resource.resource_id',
                        to: 'practice_resource.practice_id'
                    },
                    to: 'practice.id'
                }
            },
            collections: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Collection',
                join: {
                    from: 'resource.id',
                    through: {
                        from: 'collection_resource.resource_id',
                        to: 'collection_resource.collection_id'
                    },
                    to: 'collection.id'
                }
            }
        }
    }

}

module.exports = Resource;
