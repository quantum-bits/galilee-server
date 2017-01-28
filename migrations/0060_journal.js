'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('journal_entry', table => {
            table.increments('id');
            table.string('title');
            table.text('entry');
            table.timestamps(true, true);
            table.integer('user_id').references('user.id');
            table.integer('reading_id').references('reading.id');
            table.integer('step_id').references('step.id');
        }),

        knex.schema.createTableIfNotExists('user_tag', table => {
            table.increments('id');
            table.integer('user_id').references('user.id');
            table.string('text');
        }),

        knex.schema.createTableIfNotExists('journal_entry_tag', table => {
            table.integer('user_tag_id').references('user_tag.id');
            table.integer('journal_entry_id').references('journal_entry.id');
            table.primary(['user_tag_id', 'journal_entry_id']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('journal'),
    ])
};
