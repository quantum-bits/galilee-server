'use strict';

const db = require('../db');

module.exports = class ReadingDayGuidance extends db.Model {
    static get tableName() {
        return 'readingDayGuidance';
    }

    static get relationMappings() {
        return {
            readingDay: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'readingDayGuidance.readingDayId',
                    to: 'readingDay.id'
                }
            },
            guidance: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'readingDayGuidance.guidanceId',
                    to: 'guidance.id'
                }
            }
        }
    }
}
