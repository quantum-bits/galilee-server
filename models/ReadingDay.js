'use strict';

const db = require('../db');

class ReadingDay extends db.Model {
    static get tableName() {
        return 'readingDay';
    }

    static get relationMappings() {
        return {
            readings: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'readingDay.id',
                    to: 'reading.readingDayId'
                }
            },
            questions: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Question',
                join: {
                    from: 'readingDay.id',
                    to: 'question.readingDayId'
                }
            }

        }
    }
}

module.exports = ReadingDay;
