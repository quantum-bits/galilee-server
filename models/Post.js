'use strict';

const db = require('../db');

module.exports = class Post extends db.Model {
    static get tableName() {
        return 'post';
    }

    static get relationMappings() {
        return {
            user: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'post.userId',
                    to: 'user.id'
                }
            },
            group: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'post.groupId',
                    to: 'group.id'
                }
            },
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'post.readingId',
                    to: 'reading.id'
                }
            }
        }
    }
}
