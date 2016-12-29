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
                    from: 'group.organization_id',
                    to: 'organization.id'
                }
            },
            users: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'group.id',
                    through: {
                        from: 'membership.group_id',
                        to: 'membership.user_id'
                    },
                    to: 'user.id'
                }
            }
        }
    }
}

module.exports = Group;
