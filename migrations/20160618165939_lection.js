'use strict';

exports.up = function (knex, Promise) {

    return Promise.all([

        knex.schema.createTableIfNotExists('lection_type', function (table) {
            table.increments('id').primary();
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('lection', function (table) {
            table.increments('id').primary();
        })
    ]);
};


exports.down = function (knex, Promise) {

};
