'use strict';

const db = require('../db');

class MimeType extends db.Model {
    static get tableName() {
        return 'mimeType';
    }

    static get relationMappings() {
        return {
            groups: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'mimeType.id',
                    to: 'resource.mimeTypeId'
                }
            }
        }
    }
}

module.exports = MimeType;
