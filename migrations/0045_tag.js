'use strict';

exports.up = function (knex, Promise) {

    return knex.schema.createTableIfNotExists('tag', table => {
        table.increments('id');
        table.string('label').notNullable();
        table.integer('userId').unsigned().references('user.id').nullable();
    });
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('tag'),
    ])
};
