'use strict';

exports.up = function (knex, Promise) {

    return knex.schema.createTableIfNotExists('config', table => {
        table.string('key').primary();
        table.string('value');
    });

};

exports.down = function (knex, Promise) {

    return knex.schema.dropTableIfExists('config');

};
