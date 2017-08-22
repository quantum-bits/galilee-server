"use strict";

const moment = require('moment');
const MasterConfig = require('./master-config');
const pgTypes = require('pg').types;

// Override node-postgres conversion of DATE fields to a timestamp.
const PG_DATE_OID = 1082;
const PG_TIMESTAMP_OID = 1114;
const PG_TIMESTAMPTZ_OID = 1184;
pgTypes.setTypeParser(PG_DATE_OID, val => val);

const knex = exports.knex = require('knex')(MasterConfig.get('db'));

const Model = exports.Model = require('objection').Model;
Model.knex(knex);

exports.deleteAllData = function () {
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
        knex('stepResource').del()

    ]).then(() => Promise.all([

        knex('group').del(),            // FK membership
        knex('journalEntry').del(),     // FK journalEntryTag
        knex('permission').del(),       // FK userPermission
        knex('resource').del(),         // FK resourceTag
        knex('userTag').del(),          // FK journalEntryTag
        knex('tag').del(),              // FK resourceTag

    ])).then(() => Promise.all([

        knex('organization').del(),     // FK group
        knex('practice').del(),         // FK direction
        knex('reading').del(),          // FK direction, jounalEntry
        knex('step').del(),             // FK journalEntry
        knex('user').del(),             // FK journalEntry, membership, resource, tag, userPermission
        knex('license').del(),          // FK resource
        knex('mediaType').del(),        // FK resource
        knex('resourceFile').del(),     // FK resource

    ])).then(() => Promise.all([

        knex('mimeType').del(),         // FK resourceFile
        knex('readingDay').del(),       // FK direction, reading
        knex('version').del(),          // FK user

    ])).catch(err => console.log('There was a problem', err));
};
