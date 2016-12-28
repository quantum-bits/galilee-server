'use strict';

const db = require('../db');

class ReadingDay extends db.Model {
    asJson() {
        return this.readings.map(reading => {
            return {
                title: 'A Reading',
                description: reading.std_ref,
                text: reading.text,
                practices: reading.allPractices(),
                collections: reading.allCollections(),
            };
        });
    }

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
