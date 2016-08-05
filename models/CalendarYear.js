'use strict';

const db = require('../db');

class CalendarYear extends db.Model {
    static get tableName() {
        return 'calendar_year';
    }

    static get idColumn() {
        return 'year';
    }

    static get relationMappings() {
        return {
            cycle: {
                relation: db.Models.BelongsToOneRelation,
                modelClass: __dirname + '/Cycle',
                from: 'calendar_year.cycle_id',
                to: 'cycle.id'
            },
            dates: {
                relation: db.Models.HasManyRelation,
                modelClass: __dirname + '/CalendarDate',
                from: 'calendar_year.year',
                to: 'calendar_date.calendar_year'
            }
        }
    }

}

module.exports = CalendarYear;
