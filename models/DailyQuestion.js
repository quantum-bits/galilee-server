'use strict';

const db = require('../db');

module.exports = class DailyQuestion extends db.Model {
    static get tableName() {
        return 'dailyQuestion';
    }

    static get relationMappings() {
        return {
            readingDay: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'dailyQuestion.readingDayId',
                    to: 'readingDay.id'
                }
            }
        };
    }
};
