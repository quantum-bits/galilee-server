"use strict";

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists('user', table => {
            table.increments('id');
            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('firstName').notNullable();
            table.string('lastName').notNullable();
            table.string('avatarUrl');
            table.dateTime('joinedOn').defaultTo(knex.raw('NOW()'));
            table.boolean('enabled').defaultTo(true);
            table.integer('preferredVersionId').references('version.id');
        }),

        knex.schema.createTableIfNotExists('organization', table => {
           table.increments('id');
           table.string('name').notNullable();
           table.timestamps();
        }),

        knex.schema.createTableIfNotExists('group', table => {
            table.increments('id');
            table.integer('organizationId').references('organization.id');
            table.string('name');
            table.boolean('enabled').defaultTo(true);
            table.dateTime('createdAt').defaultTo(knex.raw('NOW()'));
        }),

        knex.schema.createTableIfNotExists('membership', table => {
            table.integer('groupId').references('group.id');
            table.integer('userId').references('user.id');
            table.boolean('enabled').defaultTo(true);
            table.dateTime('createdAt').defaultTo(knex.raw('NOW()'));
            table.primary(['groupId', 'userId']);
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

        knex.schema.createTableIfNotExists('userPermission', table => {
            table.integer('userId').references('user.id');
            table.string('permissionId').references('permission.id');
            table.primary(['userId', 'permissionId']);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('version')
        .then(Promise.all([
            knex.schema.dropTableIfExists('userPermission'),
            knex.schema.dropTableIfExists('permission'),
            knex.schema.dropTableIfExists('user')
        ]))
        .catch(err => console.log('There was a problem', err));
};
