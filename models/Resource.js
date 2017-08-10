'use strict';

const db = require('../db');

class Resource extends db.Model {
    static get tableName() {
        return 'resource';
    }

    static get relationMappings() {
        return {
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
            },
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
            license: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/License',
                join: {
                    from: 'resource.licenseId',
                    to: 'license.id'
                }
            },
            mediaType: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/MediaType',
                join: {
                    from: 'resource.mediaTypeId',
                    to: 'mediaType.id'
                }
            },
            mimeType: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/MimeType',
                join: {
                    from: 'resource.mimeTypeId',
                    to: 'mimeType.id'
                }
            }
        }
    }

}

module.exports = Resource;
