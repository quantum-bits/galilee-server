'use strict';

exports.seed = function (knex, Promise) {
    return knex('config').del();
};
