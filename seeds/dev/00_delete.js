'use strict';

// Clean out all data. Do as much work in parallel as possible, but must delete rows
// with foreign keys to other tables before those tables. Comments show which tables
// have foreign keys to the given table.

exports.seed = function (knex, Promise) {
    return Promise.all([
        // Not referenced by any foreign key
        knex('direction').del(),
        knex('config').del(),
        knex('journalEntryTag').del(),
        knex('membership').del(),
        knex('resourceTag').del(),
        knex('userPermission').del(),
        knex('post').del(),
        knex('passage').del(),

    ]).then(() => Promise.all([

        knex('group').del(),            // FK membership
        knex('journalEntry').del(),     // FK journalEntryTag
        knex('permission').del(),       // FK userPermission
        knex('resource').del(),         // FK resourceTag
        knex('tag').del(),              // FK journalEntryTag, resourceTag

    ])).then(() => Promise.all([

        knex('resourceType').del(),     // FK resource
        knex('organization').del(),     // FK group
        knex('practice').del(),         // FK direction
        knex('reading').del(),          // FK direction, jounalEntry
        knex('step').del(),             // FK journalEntry
        knex('user').del(),             // FK journalEntry, membership, resource, tag, userPermission

    ])).then(() => Promise.all([

        knex('readingDay').del(),       // FK direction, reading
        knex('version').del(),          // FK user

    ])).catch(err => console.log('There was a problem', err));
};
