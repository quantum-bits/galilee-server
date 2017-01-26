'use strict';

const db = require('../db');

module.exports = class DailyQuestion extends db.Model {
    static get tableName() {
        return 'daily_question';
    }

    static get relationMappings() {
        return {
            reading_day: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'daily_question.reading_day_id',
                    to: 'reading_day.id'
                }
            }
        };
    }
};
