'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('reading_day', table => {
            table.increments('id');
            table.date('date');
            table.string('name');
        }),

        knex.schema.createTableIfNotExists('reading', table => {
            table.increments('id');
            table.integer('reading_day_id').references('reading_day.id');
            table.integer('seq');
            table.string('std_ref');
            table.string('osis_ref');
            table.text('passage');
        }),

        knex.schema.createTableIfNotExists('daily_question', table => {
            table.increments('id');
            table.integer('reading_day_id').references('reading_day.id');
            table.integer('seq');
            table.string('question');
        })

    ]);
};

exports.down = function (knex, Promise) {

    return Promise.all([
        knex.schema.dropTableIfExists('reading'),
        knex.schema.dropTableIfExists('day'),
    ])

};
