'use strict';

const db = require('../db');

class Reading extends db.Model {
    static get tableName() {
        return 'reading';
    }

    static get relationMappings() {
        return {
            reading_day: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'reading.reading_day_id',
                    to: 'reading_day.id'
                }
            },
            applications: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/Application',
                join: {
                    from: 'reading.id',
                    to: 'application.reading_id'
                }
            },
            practices: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Practice',
                join: {
                    from: 'reading.id',
                    through: {
                        from: 'application.reading_id',
                        to: 'application.practice_id'
                    },
                    to: 'practice.id'
                }
            }
        }
    }

}

module.exports = Reading;
