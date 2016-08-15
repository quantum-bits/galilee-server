'use strict';

const db = require('../db');

class Permission extends db.Model {
    static get tableName() {
        return 'permission';
    }

    static get relationMappings() {
        return {
            users: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/User',
                join: {
                    from: 'permission.id',
                    through: {
                        from: 'user_permission.version_id',
                        to: 'user_permission.user_id'
                    },
                    to: 'user.id'
                }
            }
        }
    }

}

module.exports = Permission;
