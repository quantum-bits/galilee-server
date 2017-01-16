'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('journal_entry', table => {
            table.increments('id');
            table.dateTime('timestamp');
            table.string('title');
            table.text('entry');
            table.integer('user_id').references('user.id');
            table.integer('reading_id').references('reading.id');
            table.integer('step_id').references('step.id');

        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('journal'),
    ])
};
