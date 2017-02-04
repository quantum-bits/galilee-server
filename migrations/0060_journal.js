'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('journalEntry', table => {
            table.increments('id');
            table.string('title');
            table.text('entry');
            table.integer('userId').references('user.id');
            table.integer('readingId').references('reading.id');
            table.integer('stepId').references('step.id');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        }),

        knex.schema.createTableIfNotExists('journalEntryTag', table => {
            table.integer('tagId').references('tag.id');
            table.integer('journalEntryId').references('journalEntry.id');
            table.primary(['tagId', 'journalEntryId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('journal'),
    ])
};
