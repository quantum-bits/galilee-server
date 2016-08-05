'use strict';

const db = require('../db');

class Cycle extends db.Model {
    static get tableName() {
        return 'cycle';
    }

    static get relationMappings() {
        return {
            years: {
                relation: db.Model.HasManyRelation,
                modelClass: __dirname + '/CalendarYear',
                from: 'cycle.id',
                to: 'calendar_year.cycle_id'
            }
        }
    }

}

module.exports = Cycle;
