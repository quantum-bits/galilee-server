'use strict';

const db = require('../db');

module.exports = class ReadingGuidance extends db.Model {
    static get tableName() {
        return 'readingGuidance';
    }

    static get relationMappings() {
        return {
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'readingGuidance.readingId',
                    to: 'reading.id'
                }
            },
            guidance: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Guidance',
                join: {
                    from: 'readingGuidance.guidanceId',
                    to: 'guidance.id'
                }
            }
        }
    }
}
