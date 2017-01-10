'use strict';

const db = require('../db');

class ReadingDay extends db.Model {
    static get tableName() {
        return 'reading_day';
    }

    static get relationMappings() {
        return {
            readings: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'reading_day.id',
                    to: 'reading.reading_day_id'
                }
            }
        }
    }
}

module.exports = ReadingDay;
