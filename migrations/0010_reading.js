'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('readingDay', table => {
            table.increments('id');
            table.date('date').unique();
            table.string('name');
        }),

        knex.schema.createTableIfNotExists('reading', table => {
            table.increments('id');
            table.integer('readingDayId').references('readingDay.id');
            table.integer('seq');
            table.string('stdRef');
            table.string('osisRef');
            table.text('passage');
        }),

        knex.schema.createTableIfNotExists('question', table => {
            table.increments('id');
            table.integer('readingDayId').references('readingDay.id');
            table.integer('seq');
            table.string('text');
        })

    ]);
};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('reading'),
        knex.schema.dropTableIfExists('day'),
    ])

};
