'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('journalEntry', table => {
            table.increments('id');
            table.string('title');
            table.text('entry');
            table.integer('userId').unsigned().references('user.id');
            table.integer('readingId').unsigned().references('reading.id');
            table.integer('stepId').unsigned().references('step.id');
            table.timestamp('createdAt', true).defaultTo(knex.fn.now());
            table.timestamp('updatedAt', true).defaultTo(knex.fn.now());
        }),

        knex.schema.createTableIfNotExists('journalEntryTag', table => {
            table.integer('tagId').unsigned().references('tag.id');
            table.integer('journalEntryId').unsigned().references('journalEntry.id');
            table.primary(['tagId', 'journalEntryId']);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('journal'),
    ])
};
