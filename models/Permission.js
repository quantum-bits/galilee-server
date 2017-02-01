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
                        from: 'userPermission.versionId',
                        to: 'userPermission.userId'
                    },
                    to: 'user.id'
                }
            }
        }
    }

}

module.exports = Permission;
