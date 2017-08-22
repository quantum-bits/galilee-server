'use strict';

const db = require('../db');

class ResourceFile extends db.Model {
    static get tableName() {
        return 'resourceFile';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'resourceFile.userId',
                    to: 'user.id'
                }
            },
            resource: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'resourceFile.id',
                    to: 'resource.resourceFileId'
                }
            },
            mimeType: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/MimeType',
                join: {
                    from: 'resourceFile.mimeTypeId',
                    to: 'mimeType.id'
                }
            }

        }
    }

}

module.exports = ResourceFile;
