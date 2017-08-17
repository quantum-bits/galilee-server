"use strict";

exports.up = function (knex, Promise) {
    return knex.schema
        .table('journalEntryTag', table => {
            table.dropForeign('tagId');
            table.renameColumn('tagId', 'userTagId');
        })
        .then(() => knex.schema.table('resourceTag', table => {
            table.dropForeign('tagId');
        }))
        .then(() => knex.schema.renameTable('tag', 'userTag'))
        .then(() => knex.schema.table('journalEntryTag', table => {
            table.foreign('userTagId').references('userTag.id');
        }))
        .then(() => knex.schema.createTable('tag', table => {
            table.increments('id');
            table.string('label').notNullable();
        }))
        .then(() => knex.schema.table('resourceTag', table => {
            table.foreign('tagId').references('tag.id');
        }))
        .then(() => knex.schema.table('resource', table => {
            table.unique('fileId');
        }));
};

exports.down = function (knex, Promise) {
};
