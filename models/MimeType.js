'use strict';

const db = require('../db');

class MimeType extends db.Model {
    static get tableName() {
        return 'mimeType';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'mimeType.id',
                    to: 'resource.mimeTypeId'
                }
            }
        }
    }
}

module.exports = MimeType;
