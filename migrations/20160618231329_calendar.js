'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('cycle', function (table) {
            table.string('id', 1).primary();
            table.string('title');
        }),

        knex.schema.createTableIfNotExists('calendar_year', function (table) {
            table.integer('year').primary();
            table.date('advent_begins');
            table.date('easter');
            table.string('cycle_id', 1).references('cycle.id');
        }),

        knex.schema.createTableIfNotExists('calendar_date', function (table) {
            table.increments('id');
            table.integer('calendar_year').references('calendar_year.year');
            table.integer('month');
            table.integer('day');
        }),

        knex.schema.createTableIfNotExists('pericope_date', function (table) {
            table.integer('pericope_id').references('pericope.id');
            table.integer('calendar_date_id').references('calendar_date.id');
            table.primary(['pericope_id', 'calendar_date_id']);
        })

    ])

};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('pericope_date'),
        knex.schema.dropTableIfExists('calendar_dat'),
        knex.schema.dropTableIfExists('calendar_year'),
        knex.schema.dropTableIfExists('cycle')
    ])

};
