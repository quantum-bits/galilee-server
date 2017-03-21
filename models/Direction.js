'use strict';

const db = require('../db');

class Direction extends db.Model {
    static get tableName() {
        return 'direction';
    }

    static get relationMappings() {
        return {
            practice: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'direction.practiceId',
                    to: 'practice.id'
                }
            },
            steps: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Step',
                join: {
                    from: 'direction.id',
                    to: 'step.directionId'
                }
            },
            reading: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/Reading',
                join: {
                    from: 'direction.readingId',
                    to: 'reading.id'
                }
            },
            readingDay: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'direction.readingDayId',
                    to: 'readingDay.id'
                }
            }
        }
    }
}

module.exports = Direction;
