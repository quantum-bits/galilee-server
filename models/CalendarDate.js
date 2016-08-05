'use strict';

const db = require('../db');

class CalendarDate extends db.Model {
    static get tableName() {
        return 'calendar_date';
    }

    static get relationMappings() {
        return {
            year: {
                relation: db.Model.BelongsToOneRelation,
                modelClass: __dirname + '/CalendarYear',
                from: 'calendar_date.calendar_year',
                to: 'calendar_year.year'
            },
            pericopes: {
                relation: db.Model.ManyToManyRelation,
                modelClass: __dirname + '/Pericope',
                join: {
                    from: 'calendar_date.id',
                    through: {
                        from: pericope_date.calendar_date_id,
                        to: pericope_date.pericope_id
                    },
                    to: 'pericope.id'
                }
            }
        }
    }
}

module.exports = CalendarDate;
