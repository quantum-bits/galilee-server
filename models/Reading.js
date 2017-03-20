'use strict';

const db = require('../db');

class Reading extends db.Model {
    static get tableName() {
        return 'reading';
    }

    static get relationMappings() {
        return {
            readingDay: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'reading.readingDayId',
                    to: 'readingDay.id'
                }
            },
            passages: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Passage',
                join: {
                    from: 'reading.id',
                    to: 'passage.readingId'
                }
            },
            guidance: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'reading.id',
                    through: {
                        from: 'readingGuidance.readingId',
                        to: 'readingGuidance.guidanceId'
                    },
                    to: 'guidance.id'
                }
            }
        }
    };
}

module.exports = Reading;
