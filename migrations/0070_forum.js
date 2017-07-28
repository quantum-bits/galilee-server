'use strict';

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTableIfNotExists('post', table => {
            table.increments('id');
            table.string('title').nullable();
            table.text('content').notNullable();
            table.integer('parentPostId').unsigned().nullable().references('post.id');
            table.integer('userId').unsigned().notNullable().references('user.id');
            table.integer('groupId').unsigned().notNullable().references('group.id');
            table.integer('readingId').unsigned().nullable().references('reading.id');
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('post'),
    ])
};
