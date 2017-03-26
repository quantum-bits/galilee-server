"use strict";

exports.up = function (knex, Promise) {
    // Recreate post-to-reading FK relationship to use cascade delete.
    return knex.schema.raw(`
    ALTER TABLE post
    DROP CONSTRAINT post_readingid_foreign,
    ADD CONSTRAINT "post_readingid_foreign"
    FOREIGN KEY ("readingId")
    REFERENCES reading(id)
    ON DELETE CASCADE;`);
};

exports.down = function (knex, Promise) {
};
