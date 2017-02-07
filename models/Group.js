'use strict';

const db = require('../db');

class Group extends db.Model {
    static get tableName() {
        return 'group';
    }

    static get relationMappings() {
        return {
            organization: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Organization',
                join: {
                    from: 'group.organizationId',
                    to: 'organization.id'
                }
            },
            users: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'group.id',
                    through: {
                        from: 'membership.groupId',
                        to: 'membership.userId'
                    },
                    to: 'user.id'
                }
            },
            posts: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Post',
                join: {
                    from: 'group.id',
                    to: 'post.groupId'
                }
            }
        }
    }
}

module.exports = Group;
