'use strict';

// Clean out all data. Do as much work in parallel as possible, but must delete rows
// with foreign keys to other tables before those tables. Comments show which tables
// have foreign keys to the given table.

const Db = require('../../db');

exports.seed = function (knex, Promise) {
    return Db.deleteAllData();
};
