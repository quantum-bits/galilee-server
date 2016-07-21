'use strict';

const db = require('../db');

class LectionType extends db.Model {
    static get tableName() {
        return 'lection_type';
    }

    static get relationMappings() {
        return {
            lections: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Lection',
                join: {
                    from: 'lection_type.id',
                    to: 'lection.lection_type_id'
                }
            }
        }
    }
}

module.exports = LectionType;
