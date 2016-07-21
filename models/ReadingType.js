'use strict';

const db = require('../db');

class ReadingType extends db.Model {
    static get tableName() {
        return 'reading_type';
    }
    
    static get relationMappings() {
        return {
            readings: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'reading_type.id',
                    to: 'reading.reading_type_id'
                }
            }
        }
    }
}

module.exports = ReadingType;
