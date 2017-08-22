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
                modelClass: __dirname + '/ResourceFile',
                join: {
                    from: 'mimeType.id',
                    to: 'resourceFile.mimeTypeId'
                }
            }
        }
    }
}

module.exports = MimeType;
