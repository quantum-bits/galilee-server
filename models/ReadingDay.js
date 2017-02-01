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
                modelClass: __dirname + '/DailyQuestion',
                join: {
                    from: 'readingDay.id',
                    to: 'dailyQuestion.readingDayId'
                }
            }

        }
    }
}

module.exports = ReadingDay;
