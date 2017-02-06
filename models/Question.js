'use strict';

const db = require('../db');

module.exports = class Question extends db.Model {
    static get tableName() {
        return 'question';
    }

    static get relationMappings() {
        return {
            readingDay: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/ReadingDay',
                join: {
                    from: 'question.readingDayId',
                    to: 'readingDay.id'
                }
            }
        };
    }
};
