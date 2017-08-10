'use strict';

const db = require('../db');

class License extends db.Model {
    static get tableName() {
        return 'license';
    }

    static get relationMappings() {
        return {
            groups: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Group',
                join: {
                    from: 'license.id',
                    to: 'resource.licenseId'
                }
            }
        }
    }
}

module.exports = License;
