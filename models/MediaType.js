'use strict';

const db = require('../db');

class MediaType extends db.Model {
    static get tableName() {
        return 'mediaType';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'mediaType.id',
                    to: 'resource.mediaTypeId'
                }
            }
        }
    }
}

module.exports = MediaType;
