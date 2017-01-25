'use strict';

const db = require('../db');

class Tag extends db.Model {
    static get tableName() {
        return 'tag';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'tag.id',
                    through :{
                        from: 'resource_tag.tag_id',
                        to: 'resource_tag.resource_id'
                    },
                    to: 'resource.id'
                }
            }
        }
    }

}

module.exports = Tag;
