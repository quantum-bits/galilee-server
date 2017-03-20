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
            guidance: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'readingDay.id',
                    through: {
                        from: 'readingDayGuidance.readingId',
                        to: 'readingDayGuidance.guidanceId'
                    },
                    to: 'guidance.id'
                }
            }
        }
    }
}

module.exports = ReadingDay;
