"use strict";

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists('user', table => {
            table.increments('id');
            table.string('email').notNullable();
            table.string('password').notNullable();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.dateTime('joined_on').defaultTo(knex.raw('NOW()'));
            table.boolean('enabled').defaultTo(true);
            table.integer('preferred_version_id').references('version.id')
        }),

        knex.schema.createTableIfNotExists('version', table => {
            table.increments('id');
            table.string('code').notNullable();
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('permission', table => {
            table.string('id').primary();
            table.string('title').notNullable();
        }),

        knex.schema.createTableIfNotExists('user_permission', table => {
            table.integer('user_id').references('user.id');
            table.string('permission_id').references('permission.id');
            table.primary(['user_id', 'permission_id']);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('version')
        .then(Promise.all([
            knex.schema.dropTableIfExists('user_permission'),
            knex.schema.dropTableIfExists('permission'),
            knex.schema.dropTableIfExists('user')
        ]))
        .catch(err => console.log('There was a problem', err));
};
