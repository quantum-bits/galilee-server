'use strict';

const db = require('../db');

class License extends db.Model {
    static get tableName() {
        return 'license';
    }

    static get relationMappings() {
        return {
            resources: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Resource',
                join: {
                    from: 'license.id',
                    to: 'resource.licenseId'
                }
            }
        }
    }
}

module.exports = License;
