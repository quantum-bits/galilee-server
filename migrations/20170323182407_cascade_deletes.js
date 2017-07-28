"use strict";

exports.up = function (knex, Promise) {
    // Recreate post-to-reading FK relationship to use cascade delete.
    return knex.schema.table('post', table => {
        table.dropForeign('readingId');
        table.foreign('readingId').references('reading.id').onDelete('CASCADE');
    });
};

exports.down = function (knex, Promise) {
};
