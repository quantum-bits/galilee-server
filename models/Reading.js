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
            applications: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Application',
                join: {
                    from: 'reading.id',
                    to: 'application.readingId'
                }
            },
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'reading.id',
                    through: {
                        from: 'application.readingId',
                        to: 'application.practiceId'
                    },
                    to: 'practice.id'
                }
            },
            posts: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Post',
                join: {
                    from: 'reading.id',
                    to: 'post.readingId'
                }
            }
        }
    };

}

module.exports = Reading;
