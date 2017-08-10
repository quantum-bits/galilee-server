'use strict';

const db = require('../db');

class MediaType extends db.Model {
    static get tableName() {
        return 'mediaType';
    }

    static get relationMappings() {
        return {
            groups: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'mediaType.id',
                    to: 'resource.mediaTypeId'
                }
            }
        }
    }
}

module.exports = MediaType;
