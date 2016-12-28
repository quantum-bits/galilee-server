'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('reading_day', table => {
           table.date('date').primary();
           table.string('name');
        }),

        knex.schema.createTableIfNotExists('reading', table => {
            table.increments('id');
            table.date('for').references('reading_day.date');
            table.integer('seq');
            table.string('std_ref');
            table.string('osis_ref');
        })

    ]);
};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('reading'),
        knex.schema.dropTableIfExists('day'),
    ])

};
