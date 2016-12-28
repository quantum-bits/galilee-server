'use strict';

const db = require('../db');

class ReadingDay extends db.Model {
    static get tableName() {
        return 'reading_day';
    }

    static get idColumn() {
        return 'date';
    }

    static get relationMappings() {
        return {
            readings: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'reading_day.date',
                    to: 'reading.for'
                }
            }
        }
    }

}

module.exports = ReadingDay;
