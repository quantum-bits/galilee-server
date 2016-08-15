'use strict';

const db = require('../db');

class User extends db.Model {
    static get tableName() {
        return 'user';
    }

    static get relationMappings() {
        return {
            version: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Version',
                join: {
                    from: 'user.preferred_version_id',
                    to: 'version.id'
                }
            },
            permissions: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Permission',
                join: {
                    from: 'user.id',
                    through: {
                        from: 'user_permission.user_id',
                        to: 'user_permission.permission_id'
                    },
                    to: 'permission.id'
                }
            }
        }
    }
}

module.exports = User;
